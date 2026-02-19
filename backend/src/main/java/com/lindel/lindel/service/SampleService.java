package com.lindel.lindel.service;

import com.lindel.lindel.entity.Sample;
import com.lindel.lindel.repository.SampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SampleService {

    private final SampleRepository sampleRepository;

    public List<Sample> getAllSamples() {
        return sampleRepository.findAll();
    }

    public Sample getSampleById(Long id) {
        return sampleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sample not found with id: " + id));
    }

    public Sample getSampleBySampleId(String sampleId) {
        return sampleRepository.findBySampleId(sampleId)
                .orElseThrow(() -> new RuntimeException("Sample not found with sampleId: " + sampleId));
    }

    public List<Sample> getSamplesByCrfId(Long crfId) {
        return sampleRepository.findByCrf_Id(crfId);
    }

    public List<Sample> getSamplesByStatus(String status) {
        return sampleRepository.findByStatus(status);
    }

    public List<Sample> getSamplesByChemist(String chemist) {
        return sampleRepository.findByAssignedTo(chemist);
    }

    @Transactional
    public Sample assignSample(Long id, String chemist) {
        Sample sample = getSampleById(id);
        sample.setAssignedTo(chemist);
        sample.setStatus("assigned");
        sample.setAssignedDate(LocalDateTime.now());
        return sampleRepository.save(sample);
    }

    @Transactional
    public Sample updateTestValues(Long id, Map<String, String> testValues) {
        Sample sample = getSampleById(id);
        
        // Merge with existing test values
        if (sample.getTestValues() == null) {
            sample.setTestValues(testValues);
        } else {
            sample.getTestValues().putAll(testValues);
        }

        // Update test status for provided parameters
        for (String parameter : testValues.keySet()) {
            if (sample.getTestStatus() == null) {
                sample.setTestStatus(Map.of(parameter, "completed"));
            } else {
                sample.getTestStatus().put(parameter, "completed");
            }
        }

        // Check if all tests are completed
        boolean allCompleted = sample.getTestStatus().values().stream()
                .allMatch(status -> "completed".equals(status));
        
        if (allCompleted) {
            sample.setStatus("completed");
            sample.setCompletedDate(LocalDateTime.now());
        } else {
            sample.setStatus("testing");
        }

        return sampleRepository.save(sample);
    }

    @Transactional
    public Sample updateSampleStatus(Long id, String status) {
        Sample sample = getSampleById(id);
        sample.setStatus(status);

        if ("completed".equals(status) && sample.getCompletedDate() == null) {
            sample.setCompletedDate(LocalDateTime.now());
        }

        return sampleRepository.save(sample);
    }

    @Transactional
    public Sample updateSample(Long id, Sample sampleDetails) {
        Sample sample = getSampleById(id);

        if (sampleDetails.getDescription() != null) sample.setDescription(sampleDetails.getDescription());
        if (sampleDetails.getSubmissionDetail() != null) sample.setSubmissionDetail(sampleDetails.getSubmissionDetail());
        if (sampleDetails.getStatus() != null) sample.setStatus(sampleDetails.getStatus());
        if (sampleDetails.getAssignedTo() != null) sample.setAssignedTo(sampleDetails.getAssignedTo());
        if (sampleDetails.getNotes() != null) sample.setNotes(sampleDetails.getNotes());

        return sampleRepository.save(sample);
    }

    public Long countByStatus(String status) {
        return sampleRepository.countByStatus(status);
    }

    public Long countByChemist(String chemist) {
        return sampleRepository.countByAssignedTo(chemist);
    }
}
