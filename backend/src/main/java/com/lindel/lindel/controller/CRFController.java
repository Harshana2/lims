package com.lindel.lindel.controller;

import com.lindel.lindel.dto.ApiResponse;
import com.lindel.lindel.entity.CRF;
import com.lindel.lindel.service.CRFService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crf")
@RequiredArgsConstructor
public class CRFController {

    private final CRFService crfService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CRF>>> getAllCRFs() {
        List<CRF> crfs = crfService.getAllCRFs();
        return ResponseEntity.ok(ApiResponse.success(crfs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CRF>> getCRFById(@PathVariable Long id) {
        try {
            CRF crf = crfService.getCRFById(id);
            return ResponseEntity.ok(ApiResponse.success(crf));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/crfId/{crfId}")
    public ResponseEntity<ApiResponse<CRF>> getCRFByCrfId(@PathVariable String crfId) {
        try {
            CRF crf = crfService.getCRFByCrfId(crfId);
            return ResponseEntity.ok(ApiResponse.success(crf));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<CRF>>> getCRFsByStatus(@PathVariable String status) {
        List<CRF> crfs = crfService.getCRFsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(crfs));
    }

    @GetMapping("/customer/{customer}")
    public ResponseEntity<ApiResponse<List<CRF>>> getCRFsByCustomer(@PathVariable String customer) {
        List<CRF> crfs = crfService.getCRFsByCustomer(customer);
        return ResponseEntity.ok(ApiResponse.success(crfs));
    }

    @GetMapping("/sampleType/{sampleType}")
    public ResponseEntity<ApiResponse<List<CRF>>> getCRFsBySampleType(@PathVariable String sampleType) {
        List<CRF> crfs = crfService.getCRFsBySampleType(sampleType);
        return ResponseEntity.ok(ApiResponse.success(crfs));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CRF>> createCRF(@RequestBody CRF crf) {
        try {
            CRF createdCRF = crfService.createCRF(crf);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("CRF created successfully", createdCRF));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CRF>> updateCRF(@PathVariable Long id, @RequestBody CRF crf) {
        try {
            CRF updatedCRF = crfService.updateCRF(id, crf);
            return ResponseEntity.ok(ApiResponse.success("CRF updated successfully", updatedCRF));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CRF>> updateCRFStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            CRF updatedCRF = crfService.updateCRFStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("CRF status updated", updatedCRF));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCRF(@PathVariable Long id) {
        try {
            crfService.deleteCRF(id);
            return ResponseEntity.ok(ApiResponse.success("CRF deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/count/{status}")
    public ResponseEntity<ApiResponse<Long>> countByStatus(@PathVariable String status) {
        Long count = crfService.countByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
