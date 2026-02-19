package com.lindel.lindel.repository;

import com.lindel.lindel.entity.CRF;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CRFRepository extends JpaRepository<CRF, Long> {
    
    Optional<CRF> findByCrfId(String crfId);
    
    List<CRF> findByStatus(String status);
    
    List<CRF> findByCustomerContainingIgnoreCase(String customer);
    
    List<CRF> findBySampleType(String sampleType);
    
    List<CRF> findByPriority(String priority);
    
    List<CRF> findByStatusAndPriority(String status, String priority);
    
    List<CRF> findByReceptionDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    Long countByStatus(String status);
    
    Boolean existsByCrfId(String crfId);
}
