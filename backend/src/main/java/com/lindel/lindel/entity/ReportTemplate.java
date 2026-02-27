package com.lindel.lindel.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_templates")
public class ReportTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String templateType; // e.g., "standard", "custom", "summary"
    
    // Header Section
    @Column(columnDefinition = "TEXT")
    private String headerContent;
    
    private Boolean includeCompanyLogo = true;
    private Boolean includeLabDetails = true;
    
    // Report Body Configuration
    private Boolean includeCRFDetails = true;
    private Boolean includeSampleDetails = true;
    private Boolean includeTestResults = true;
    private Boolean includeTestMethods = true;
    private Boolean includeChemistInfo = true;
    
    // Footer Section
    @Column(columnDefinition = "TEXT")
    private String footerContent;
    
    private Boolean includeSignatures = true;
    private Boolean includePageNumbers = true;
    private Boolean includeGeneratedDate = true;
    
    // Layout & Styling
    private String pageSize = "A4"; // A4, Letter, Legal
    private String orientation = "portrait"; // portrait, landscape
    
    @Column(columnDefinition = "TEXT")
    private String customCSS;
    
    // Additional Sections
    @Column(columnDefinition = "TEXT")
    private String additionalNotes;
    
    @Column(columnDefinition = "TEXT")
    private String disclaimer;
    
    // Metadata
    private String createdBy;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Boolean isDefault = false;
    private Boolean isActive = true;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getTemplateType() {
        return templateType;
    }
    
    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }
    
    public String getHeaderContent() {
        return headerContent;
    }
    
    public void setHeaderContent(String headerContent) {
        this.headerContent = headerContent;
    }
    
    public Boolean getIncludeCompanyLogo() {
        return includeCompanyLogo;
    }
    
    public void setIncludeCompanyLogo(Boolean includeCompanyLogo) {
        this.includeCompanyLogo = includeCompanyLogo;
    }
    
    public Boolean getIncludeLabDetails() {
        return includeLabDetails;
    }
    
    public void setIncludeLabDetails(Boolean includeLabDetails) {
        this.includeLabDetails = includeLabDetails;
    }
    
    public Boolean getIncludeCRFDetails() {
        return includeCRFDetails;
    }
    
    public void setIncludeCRFDetails(Boolean includeCRFDetails) {
        this.includeCRFDetails = includeCRFDetails;
    }
    
    public Boolean getIncludeSampleDetails() {
        return includeSampleDetails;
    }
    
    public void setIncludeSampleDetails(Boolean includeSampleDetails) {
        this.includeSampleDetails = includeSampleDetails;
    }
    
    public Boolean getIncludeTestResults() {
        return includeTestResults;
    }
    
    public void setIncludeTestResults(Boolean includeTestResults) {
        this.includeTestResults = includeTestResults;
    }
    
    public Boolean getIncludeTestMethods() {
        return includeTestMethods;
    }
    
    public void setIncludeTestMethods(Boolean includeTestMethods) {
        this.includeTestMethods = includeTestMethods;
    }
    
    public Boolean getIncludeChemistInfo() {
        return includeChemistInfo;
    }
    
    public void setIncludeChemistInfo(Boolean includeChemistInfo) {
        this.includeChemistInfo = includeChemistInfo;
    }
    
    public String getFooterContent() {
        return footerContent;
    }
    
    public void setFooterContent(String footerContent) {
        this.footerContent = footerContent;
    }
    
    public Boolean getIncludeSignatures() {
        return includeSignatures;
    }
    
    public void setIncludeSignatures(Boolean includeSignatures) {
        this.includeSignatures = includeSignatures;
    }
    
    public Boolean getIncludePageNumbers() {
        return includePageNumbers;
    }
    
    public void setIncludePageNumbers(Boolean includePageNumbers) {
        this.includePageNumbers = includePageNumbers;
    }
    
    public Boolean getIncludeGeneratedDate() {
        return includeGeneratedDate;
    }
    
    public void setIncludeGeneratedDate(Boolean includeGeneratedDate) {
        this.includeGeneratedDate = includeGeneratedDate;
    }
    
    public String getPageSize() {
        return pageSize;
    }
    
    public void setPageSize(String pageSize) {
        this.pageSize = pageSize;
    }
    
    public String getOrientation() {
        return orientation;
    }
    
    public void setOrientation(String orientation) {
        this.orientation = orientation;
    }
    
    public String getCustomCSS() {
        return customCSS;
    }
    
    public void setCustomCSS(String customCSS) {
        this.customCSS = customCSS;
    }
    
    public String getAdditionalNotes() {
        return additionalNotes;
    }
    
    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
    
    public String getDisclaimer() {
        return disclaimer;
    }
    
    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Boolean getIsDefault() {
        return isDefault;
    }
    
    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
