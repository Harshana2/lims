package com.lindel.lindel.service;

import com.lindel.lindel.entity.Chemist;
import com.lindel.lindel.exception.ResourceNotFoundException;
import com.lindel.lindel.repository.ChemistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChemistService {
    
    private final ChemistRepository chemistRepository;
    
    public List<Chemist> getAllChemists() {
        return chemistRepository.findAll();
    }
    
    public Chemist getChemistById(Long id) {
        return chemistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chemist not found with id: " + id));
    }
    
    public List<Chemist> getAvailableChemists() {
        return chemistRepository.findByActive(true);
    }
    
    public Chemist getChemistByName(String name) {
        return chemistRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Chemist not found with name: " + name));
    }
    
    public Chemist createChemist(Chemist chemist) {
        return chemistRepository.save(chemist);
    }
    
    public Chemist updateChemist(Long id, Chemist chemistDetails) {
        Chemist chemist = getChemistById(id);
        
        if (chemistDetails.getName() != null) {
            chemist.setName(chemistDetails.getName());
        }
        if (chemistDetails.getEmail() != null) {
            chemist.setEmail(chemistDetails.getEmail());
        }
        if (chemistDetails.getSpecialization() != null) {
            chemist.setSpecialization(chemistDetails.getSpecialization());
        }
        if (chemistDetails.getActiveTasks() != null) {
            chemist.setActiveTasks(chemistDetails.getActiveTasks());
        }
        if (chemistDetails.getCompletedThisWeek() != null) {
            chemist.setCompletedThisWeek(chemistDetails.getCompletedThisWeek());
        }
        if (chemistDetails.getCompletedThisMonth() != null) {
            chemist.setCompletedThisMonth(chemistDetails.getCompletedThisMonth());
        }
        if (chemistDetails.getActive() != null) {
            chemist.setActive(chemistDetails.getActive());
        }
        
        return chemistRepository.save(chemist);
    }
    
    public void deleteChemist(Long id) {
        Chemist chemist = getChemistById(id);
        chemistRepository.delete(chemist);
    }
    
    public void incrementActiveTasks(Long id) {
        Chemist chemist = getChemistById(id);
        chemist.setActiveTasks(chemist.getActiveTasks() + 1);
        chemistRepository.save(chemist);
    }
    
    public void decrementActiveTasks(Long id) {
        Chemist chemist = getChemistById(id);
        if (chemist.getActiveTasks() > 0) {
            chemist.setActiveTasks(chemist.getActiveTasks() - 1);
        }
        chemistRepository.save(chemist);
    }
}
