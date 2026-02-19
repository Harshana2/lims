package com.lindel.lindel.repository;

import com.lindel.lindel.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    
    Optional<Quotation> findByQuotationId(String quotationId);
    
    List<Quotation> findByRequestId(Long requestId);
    
    List<Quotation> findByStatus(String status);
    
    List<Quotation> findByCustomerContainingIgnoreCase(String customer);
    
    Long countByStatus(String status);
    
    Boolean existsByQuotationId(String quotationId);
}
