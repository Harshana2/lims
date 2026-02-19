package com.lindel.lindel.controller;

import com.lindel.lindel.dto.ApiResponse;
import com.lindel.lindel.entity.Sample;
import com.lindel.lindel.service.SampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/samples")
@RequiredArgsConstructor
public class SampleController {

    private final SampleService sampleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Sample>>> getAllSamples() {
        List<Sample> samples = sampleService.getAllSamples();
        return ResponseEntity.ok(ApiResponse.success(samples));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Sample>> getSampleById(@PathVariable Long id) {
        try {
            Sample sample = sampleService.getSampleById(id);
            return ResponseEntity.ok(ApiResponse.success(sample));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sampleId/{sampleId}")
    public ResponseEntity<ApiResponse<Sample>> getSampleBySampleId(@PathVariable String sampleId) {
        try {
            Sample sample = sampleService.getSampleBySampleId(sampleId);
            return ResponseEntity.ok(ApiResponse.success(sample));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/crf/{crfId}")
    public ResponseEntity<ApiResponse<List<Sample>>> getSamplesByCrfId(@PathVariable Long crfId) {
        List<Sample> samples = sampleService.getSamplesByCrfId(crfId);
        return ResponseEntity.ok(ApiResponse.success(samples));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Sample>>> getSamplesByStatus(@PathVariable String status) {
        List<Sample> samples = sampleService.getSamplesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(samples));
    }

    @GetMapping("/chemist/{chemist}")
    public ResponseEntity<ApiResponse<List<Sample>>> getSamplesByChemist(@PathVariable String chemist) {
        List<Sample> samples = sampleService.getSamplesByChemist(chemist);
        return ResponseEntity.ok(ApiResponse.success(samples));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<Sample>> assignSample(
            @PathVariable Long id,
            @RequestParam String chemist) {
        try {
            Sample sample = sampleService.assignSample(id, chemist);
            return ResponseEntity.ok(ApiResponse.success("Sample assigned successfully", sample));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/test-values")
    public ResponseEntity<ApiResponse<Sample>> updateTestValues(
            @PathVariable Long id,
            @RequestBody Map<String, String> testValues) {
        try {
            Sample sample = sampleService.updateTestValues(id, testValues);
            return ResponseEntity.ok(ApiResponse.success("Test values updated successfully", sample));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Sample>> updateSampleStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Sample sample = sampleService.updateSampleStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Sample status updated", sample));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Sample>> updateSample(
            @PathVariable Long id,
            @RequestBody Sample sample) {
        try {
            Sample updatedSample = sampleService.updateSample(id, sample);
            return ResponseEntity.ok(ApiResponse.success("Sample updated successfully", updatedSample));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/count/status/{status}")
    public ResponseEntity<ApiResponse<Long>> countByStatus(@PathVariable String status) {
        Long count = sampleService.countByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/count/chemist/{chemist}")
    public ResponseEntity<ApiResponse<Long>> countByChemist(@PathVariable String chemist) {
        Long count = sampleService.countByChemist(chemist);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
