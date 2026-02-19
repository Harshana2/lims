package com.lindel.lindel.repository;

import com.lindel.lindel.entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    
    Optional<Request> findByRequestId(String requestId);
    
    List<Request> findByStatus(String status);
    
    List<Request> findByCustomerContainingIgnoreCase(String customer);
    
    List<Request> findBySampleType(String sampleType);
    
    List<Request> findByPriority(String priority);
    
    Long countByStatus(String status);
    
    Boolean existsByRequestId(String requestId);
}
