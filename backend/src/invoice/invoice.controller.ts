import { Controller, Get, Param, Res, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE_HIERARCHY, ROLES } from '../auth/constants/roles.constant';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Invoice')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get(':orderId/html')
  @Roles(ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Lấy hóa đơn dưới dạng HTML' })
  @ApiParam({ name: 'orderId', description: 'ID của đơn hàng', type: 'number' })
  @ApiResponse({ status: 200, description: 'HTML hóa đơn' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async getInvoiceHTML(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Res() res: Response
  ) {
    try {
      const invoiceData = await this.invoiceService.getInvoiceData(orderId);
      const html = this.invoiceService.generateInvoiceHTML(invoiceData);
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      throw error;
    }
  }

  @Get(':orderId/pdf')
  @Roles(ROLES.STAFF)
  @ApiOperation({ summary: 'Xuất hóa đơn dưới dạng PDF' })
  @ApiParam({ name: 'orderId', description: 'ID của đơn hàng', type: 'number' })
  @ApiResponse({ status: 200, description: 'PDF hóa đơn' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async getInvoicePDF(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Res() res: Response
  ) {
    try {
      const pdfBuffer = await this.invoiceService.generateInvoicePDF(orderId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="hoa-don-${orderId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      throw error;
    }
  }

  @Get(':orderId/data')
  @Roles(ROLES.STAFF)
  @ApiOperation({ summary: 'Lấy dữ liệu hóa đơn' })
  @ApiParam({ name: 'orderId', description: 'ID của đơn hàng', type: 'number' })
  @ApiResponse({ status: 200, description: 'Dữ liệu hóa đơn' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async getInvoiceData(@Param('orderId', ParseIntPipe) orderId: number) {
    return await this.invoiceService.getInvoiceData(orderId);
  }
} 