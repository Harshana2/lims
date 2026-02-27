package com.lindel.lindel.service;

import com.lindel.lindel.entity.ReportTemplate;
import com.lindel.lindel.repository.ReportTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReportTemplateService {
    
    @Autowired
    private ReportTemplateRepository reportTemplateRepository;
    
    // Get all templates
    public List<ReportTemplate> getAllTemplates() {
        return reportTemplateRepository.findAll();
    }
    
    // Get all active templates
    public List<ReportTemplate> getActiveTemplates() {
        return reportTemplateRepository.findByIsActiveTrue();
    }
    
    // Get template by ID
    public Optional<ReportTemplate> getTemplateById(Long id) {
        return reportTemplateRepository.findById(id);
    }
    
    // Get default template
    public Optional<ReportTemplate> getDefaultTemplate() {
        return reportTemplateRepository.findByIsDefaultTrue();
    }
    
    // Get templates by type
    public List<ReportTemplate> getTemplatesByType(String templateType) {
        return reportTemplateRepository.findByTemplateType(templateType);
    }
    
    // Get templates by creator
    public List<ReportTemplate> getTemplatesByCreator(String createdBy) {
        return reportTemplateRepository.findByCreatedBy(createdBy);
    }
    
    // Create new template
    @Transactional
    public ReportTemplate createTemplate(ReportTemplate template) {
        // If setting as default, unset other defaults
        if (template.getIsDefault() != null && template.getIsDefault()) {
            Optional<ReportTemplate> existingDefault = reportTemplateRepository.findByIsDefaultTrue();
            existingDefault.ifPresent(defaultTemplate -> {
                defaultTemplate.setIsDefault(false);
                reportTemplateRepository.save(defaultTemplate);
            });
        }
        return reportTemplateRepository.save(template);
    }
    
    // Update template
    @Transactional
    public ReportTemplate updateTemplate(Long id, ReportTemplate templateDetails) {
        ReportTemplate template = reportTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
        
        // Update fields
        template.setName(templateDetails.getName());
        template.setDescription(templateDetails.getDescription());
        template.setTemplateType(templateDetails.getTemplateType());
        template.setHeaderContent(templateDetails.getHeaderContent());
        template.setIncludeCompanyLogo(templateDetails.getIncludeCompanyLogo());
        template.setIncludeLabDetails(templateDetails.getIncludeLabDetails());
        template.setIncludeCRFDetails(templateDetails.getIncludeCRFDetails());
        template.setIncludeSampleDetails(templateDetails.getIncludeSampleDetails());
        template.setIncludeTestResults(templateDetails.getIncludeTestResults());
        template.setIncludeTestMethods(templateDetails.getIncludeTestMethods());
        template.setIncludeChemistInfo(templateDetails.getIncludeChemistInfo());
        template.setFooterContent(templateDetails.getFooterContent());
        template.setIncludeSignatures(templateDetails.getIncludeSignatures());
        template.setIncludePageNumbers(templateDetails.getIncludePageNumbers());
        template.setIncludeGeneratedDate(templateDetails.getIncludeGeneratedDate());
        template.setPageSize(templateDetails.getPageSize());
        template.setOrientation(templateDetails.getOrientation());
        template.setCustomCSS(templateDetails.getCustomCSS());
        template.setAdditionalNotes(templateDetails.getAdditionalNotes());
        template.setDisclaimer(templateDetails.getDisclaimer());
        template.setIsActive(templateDetails.getIsActive());
        
        // If setting as default, unset other defaults
        if (templateDetails.getIsDefault() != null && templateDetails.getIsDefault() && !template.getIsDefault()) {
            Optional<ReportTemplate> existingDefault = reportTemplateRepository.findByIsDefaultTrue();
            existingDefault.ifPresent(defaultTemplate -> {
                if (!defaultTemplate.getId().equals(id)) {
                    defaultTemplate.setIsDefault(false);
                    reportTemplateRepository.save(defaultTemplate);
                }
            });
        }
        template.setIsDefault(templateDetails.getIsDefault());
        
        return reportTemplateRepository.save(template);
    }
    
    // Delete template
    @Transactional
    public void deleteTemplate(Long id) {
        ReportTemplate template = reportTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
        
        // Don't allow deletion of default template
        if (template.getIsDefault()) {
            throw new RuntimeException("Cannot delete default template");
        }
        
        reportTemplateRepository.deleteById(id);
    }
    
    // Set template as default
    @Transactional
    public ReportTemplate setAsDefault(Long id) {
        ReportTemplate template = reportTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
        
        // Unset other defaults
        Optional<ReportTemplate> existingDefault = reportTemplateRepository.findByIsDefaultTrue();
        existingDefault.ifPresent(defaultTemplate -> {
            defaultTemplate.setIsDefault(false);
            reportTemplateRepository.save(defaultTemplate);
        });
        
        template.setIsDefault(true);
        return reportTemplateRepository.save(template);
    }
    
    // Toggle template active status
    @Transactional
    public ReportTemplate toggleActiveStatus(Long id) {
        ReportTemplate template = reportTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
        
        template.setIsActive(!template.getIsActive());
        return reportTemplateRepository.save(template);
    }
}
