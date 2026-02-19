package com.lindel.lindel.controller;

import com.lindel.lindel.dto.ApiResponse;
import com.lindel.lindel.entity.Request;
import com.lindel.lindel.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Request>>> getAllRequests() {
        List<Request> requests = requestService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Request>> getRequestById(@PathVariable Long id) {
        try {
            Request request = requestService.getRequestById(id);
            return ResponseEntity.ok(ApiResponse.success(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/requestId/{requestId}")
    public ResponseEntity<ApiResponse<Request>> getRequestByRequestId(@PathVariable String requestId) {
        try {
            Request request = requestService.getRequestByRequestId(requestId);
            return ResponseEntity.ok(ApiResponse.success(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Request>>> getRequestsByStatus(@PathVariable String status) {
        List<Request> requests = requestService.getRequestsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/customer/{customer}")
    public ResponseEntity<ApiResponse<List<Request>>> getRequestsByCustomer(@PathVariable String customer) {
        List<Request> requests = requestService.getRequestsByCustomer(customer);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Request>> createRequest(@RequestBody Request request) {
        try {
            Request createdRequest = requestService.createRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Request created successfully", createdRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Request>> updateRequest(@PathVariable Long id, @RequestBody Request request) {
        try {
            Request updatedRequest = requestService.updateRequest(id, request);
            return ResponseEntity.ok(ApiResponse.success("Request updated successfully", updatedRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Request>> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Request updatedRequest = requestService.updateRequestStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Request status updated", updatedRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable Long id) {
        try {
            requestService.deleteRequest(id);
            return ResponseEntity.ok(ApiResponse.success("Request deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/count/{status}")
    public ResponseEntity<ApiResponse<Long>> countByStatus(@PathVariable String status) {
        Long count = requestService.countByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
