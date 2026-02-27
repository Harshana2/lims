package com.lindel.lindel.repository;

import com.lindel.lindel.entity.ReportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, Long> {
    
    List<ReportTemplate> findByIsActiveTrue();
    
    Optional<ReportTemplate> findByIsDefaultTrue();
    
    List<ReportTemplate> findByTemplateType(String templateType);
    
    List<ReportTemplate> findByCreatedBy(String createdBy);
}
