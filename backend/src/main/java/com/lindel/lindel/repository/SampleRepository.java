package com.lindel.lindel.repository;

import com.lindel.lindel.entity.Sample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SampleRepository extends JpaRepository<Sample, Long> {
    
    Optional<Sample> findBySampleId(String sampleId);
    
    List<Sample> findByCrf_Id(Long crfId);
    
    List<Sample> findByStatus(String status);
    
    List<Sample> findByAssignedTo(String assignedTo);
    
    List<Sample> findByStatusAndAssignedTo(String status, String assignedTo);
    
    Long countByStatus(String status);
    
    Long countByAssignedTo(String assignedTo);
    
    Boolean existsBySampleId(String sampleId);
    
    @Query("SELECT COUNT(s) FROM Sample s WHERE s.sampleId LIKE :prefix%")
    Long countBySampleIdPrefix(@Param("prefix") String prefix);
}
