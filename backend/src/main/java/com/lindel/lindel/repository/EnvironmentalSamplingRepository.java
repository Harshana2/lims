package com.lindel.lindel.repository;

import com.lindel.lindel.entity.EnvironmentalSampling;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnvironmentalSamplingRepository extends JpaRepository<EnvironmentalSampling, Long> {
    
    Optional<EnvironmentalSampling> findByCrfId(Long crfId);
    
    List<EnvironmentalSampling> findByMapType(String mapType);
    
    List<EnvironmentalSampling> findBySubmittedBy(String submittedBy);
}
