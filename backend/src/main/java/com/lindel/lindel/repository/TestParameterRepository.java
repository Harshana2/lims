package com.lindel.lindel.repository;

import com.lindel.lindel.entity.TestParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestParameterRepository extends JpaRepository<TestParameter, Long> {
    
    Optional<TestParameter> findByName(String name);
    
    List<TestParameter> findByActive(Boolean active);
    
    List<TestParameter> findByCategory(String category);
    
    List<TestParameter> findByApplicableSampleTypesContaining(String sampleType);
    
    List<TestParameter> findByNameContainingIgnoreCase(String name);
    
    Boolean existsByName(String name);
}
