package com.lindel.lindel.repository;

import com.lindel.lindel.entity.Chemist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChemistRepository extends JpaRepository<Chemist, Long> {
    
    Optional<Chemist> findByName(String name);
    
    List<Chemist> findByActive(Boolean active);
    
    List<Chemist> findBySpecialization(String specialization);
    
    Boolean existsByName(String name);
}
