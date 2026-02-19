package com.lindel.lindel.controller;

import com.lindel.lindel.dto.ApiResponse;
import com.lindel.lindel.entity.Quotation;
import com.lindel.lindel.service.QuotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Quotation>>> getAllQuotations() {
        List<Quotation> quotations = quotationService.getAllQuotations();
        return ResponseEntity.ok(ApiResponse.success(quotations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Quotation>> getQuotationById(@PathVariable Long id) {
        try {
            Quotation quotation = quotationService.getQuotationById(id);
            return ResponseEntity.ok(ApiResponse.success(quotation));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/quotationId/{quotationId}")
    public ResponseEntity<ApiResponse<Quotation>> getQuotationByQuotationId(@PathVariable String quotationId) {
        try {
            Quotation quotation = quotationService.getQuotationByQuotationId(quotationId);
            return ResponseEntity.ok(ApiResponse.success(quotation));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<ApiResponse<List<Quotation>>> getQuotationsByRequestId(@PathVariable Long requestId) {
        List<Quotation> quotations = quotationService.getQuotationsByRequestId(requestId);
        return ResponseEntity.ok(ApiResponse.success(quotations));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Quotation>>> getQuotationsByStatus(@PathVariable String status) {
        List<Quotation> quotations = quotationService.getQuotationsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(quotations));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Quotation>> createQuotation(@RequestBody Quotation quotation) {
        try {
            Quotation createdQuotation = quotationService.createQuotation(quotation);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Quotation created successfully", createdQuotation));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Quotation>> updateQuotation(
            @PathVariable Long id,
            @RequestBody Quotation quotation) {
        try {
            Quotation updatedQuotation = quotationService.updateQuotation(id, quotation);
            return ResponseEntity.ok(ApiResponse.success("Quotation updated successfully", updatedQuotation));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Quotation>> updateQuotationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Quotation updatedQuotation = quotationService.updateQuotationStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Quotation status updated", updatedQuotation));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuotation(@PathVariable Long id) {
        try {
            quotationService.deleteQuotation(id);
            return ResponseEntity.ok(ApiResponse.success("Quotation deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/count/{status}")
    public ResponseEntity<ApiResponse<Long>> countByStatus(@PathVariable String status) {
        Long count = quotationService.countByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
