package com.lindel.lindel.controller;

import com.lindel.lindel.dto.ApiResponse;
import com.lindel.lindel.entity.Chemist;
import com.lindel.lindel.service.ChemistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chemists")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ChemistController {
    
    private final ChemistService chemistService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Chemist>>> getAllChemists() {
        List<Chemist> chemists = chemistService.getAllChemists();
        return ResponseEntity.ok(ApiResponse.success(chemists));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Chemist>> getChemistById(@PathVariable Long id) {
        try {
            Chemist chemist = chemistService.getChemistById(id);
            return ResponseEntity.ok(ApiResponse.success(chemist));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Chemist>>> getAvailableChemists() {
        List<Chemist> chemists = chemistService.getAvailableChemists();
        return ResponseEntity.ok(ApiResponse.success(chemists));
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<Chemist>> getChemistByName(@PathVariable String name) {
        try {
            Chemist chemist = chemistService.getChemistByName(name);
            return ResponseEntity.ok(ApiResponse.success(chemist));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Chemist>> createChemist(@RequestBody Chemist chemist) {
        try {
            Chemist created = chemistService.createChemist(chemist);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Chemist created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Chemist>> updateChemist(
            @PathVariable Long id,
            @RequestBody Chemist chemist) {
        try {
            Chemist updated = chemistService.updateChemist(id, chemist);
            return ResponseEntity.ok(ApiResponse.success("Chemist updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/workload")
    public ResponseEntity<ApiResponse<Chemist>> updateWorkload(
            @PathVariable Long id,
            @RequestBody WorkloadUpdate workload) {
        try {
            Chemist chemist = chemistService.getChemistById(id);
            chemist.setActiveTasks(workload.getCurrentWorkload());
            Chemist updated = chemistService.updateChemist(id, chemist);
            return ResponseEntity.ok(ApiResponse.success("Workload updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChemist(@PathVariable Long id) {
        try {
            chemistService.deleteChemist(id);
            return ResponseEntity.ok(ApiResponse.success("Chemist deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Inner class for workload update
    public static class WorkloadUpdate {
        private Integer currentWorkload;
        
        public Integer getCurrentWorkload() {
            return currentWorkload;
        }
        
        public void setCurrentWorkload(Integer currentWorkload) {
            this.currentWorkload = currentWorkload;
        }
    }
}
