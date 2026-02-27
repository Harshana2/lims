package com.lindel.lindel.controller;

import com.lindel.lindel.dto.ApiResponse;
import com.lindel.lindel.entity.ReportTemplate;
import com.lindel.lindel.service.ReportTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/report-templates")
@CrossOrigin(origins = "*")
public class ReportTemplateController {
    
    @Autowired
    private ReportTemplateService reportTemplateService;
    
    // Get all templates
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportTemplate>>> getAllTemplates() {
        try {
            List<ReportTemplate> templates = reportTemplateService.getAllTemplates();
            return ResponseEntity.ok(ApiResponse.success("Templates retrieved successfully", templates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve templates: " + e.getMessage()));
        }
    }
    
    // Get active templates
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ReportTemplate>>> getActiveTemplates() {
        try {
            List<ReportTemplate> templates = reportTemplateService.getActiveTemplates();
            return ResponseEntity.ok(ApiResponse.success("Active templates retrieved successfully", templates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve active templates: " + e.getMessage()));
        }
    }
    
    // Get template by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportTemplate>> getTemplateById(@PathVariable Long id) {
        try {
            Optional<ReportTemplate> template = reportTemplateService.getTemplateById(id);
            if (template.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Template retrieved successfully", template.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Template not found with id: " + id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve template: " + e.getMessage()));
        }
    }
    
    // Get default template
    @GetMapping("/default")
    public ResponseEntity<ApiResponse<ReportTemplate>> getDefaultTemplate() {
        try {
            Optional<ReportTemplate> template = reportTemplateService.getDefaultTemplate();
            if (template.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Default template retrieved successfully", template.get()));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No default template found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve default template: " + e.getMessage()));
        }
    }
    
    // Get templates by type
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<ReportTemplate>>> getTemplatesByType(@PathVariable String type) {
        try {
            List<ReportTemplate> templates = reportTemplateService.getTemplatesByType(type);
            return ResponseEntity.ok(ApiResponse.success("Templates retrieved successfully", templates));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve templates by type: " + e.getMessage()));
        }
    }
    
    // Create new template
    @PostMapping
    public ResponseEntity<ApiResponse<ReportTemplate>> createTemplate(@RequestBody ReportTemplate template) {
        try {
            ReportTemplate createdTemplate = reportTemplateService.createTemplate(template);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Template created successfully", createdTemplate));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create template: " + e.getMessage()));
        }
    }
    
    // Update template
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportTemplate>> updateTemplate(
            @PathVariable Long id,
            @RequestBody ReportTemplate template) {
        try {
            ReportTemplate updatedTemplate = reportTemplateService.updateTemplate(id, template);
            return ResponseEntity.ok(ApiResponse.success("Template updated successfully", updatedTemplate));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update template: " + e.getMessage()));
        }
    }
    
    // Delete template
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTemplate(@PathVariable Long id) {
        try {
            reportTemplateService.deleteTemplate(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Template deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete template: " + e.getMessage()));
        }
    }
    
    // Set template as default
    @PatchMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<ReportTemplate>> setAsDefault(@PathVariable Long id) {
        try {
            ReportTemplate template = reportTemplateService.setAsDefault(id);
            return ResponseEntity.ok(ApiResponse.success("Template set as default successfully", template));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to set template as default: " + e.getMessage()));
        }
    }
    
    // Toggle active status
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<ReportTemplate>> toggleActiveStatus(@PathVariable Long id) {
        try {
            ReportTemplate template = reportTemplateService.toggleActiveStatus(id);
            return ResponseEntity.ok(ApiResponse.success("Template status toggled successfully", template));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to toggle template status: " + e.getMessage()));
        }
    }
}
