package com.lindel.lindel.service;

import com.lindel.lindel.entity.CRF;
import com.lindel.lindel.entity.Sample;
import com.lindel.lindel.repository.CRFRepository;
import com.lindel.lindel.repository.SampleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CRFService {

    private final CRFRepository crfRepository;
    private final SampleRepository sampleRepository;

    public List<CRF> getAllCRFs() {
        return crfRepository.findAll();
    }

    public CRF getCRFById(Long id) {
        return crfRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CRF not found with id: " + id));
    }

    public CRF getCRFByCrfId(String crfId) {
        return crfRepository.findByCrfId(crfId)
                .orElseThrow(() -> new RuntimeException("CRF not found with crfId: " + crfId));
    }

    public List<CRF> getCRFsByStatus(String status) {
        return crfRepository.findByStatus(status);
    }

    public List<CRF> getCRFsByCustomer(String customer) {
        return crfRepository.findByCustomerContainingIgnoreCase(customer);
    }

    public List<CRF> getCRFsBySampleType(String sampleType) {
        return crfRepository.findBySampleType(sampleType);
    }

    @Transactional
    public CRF createCRF(CRF crf) {
        // Generate CRF ID if not provided
        if (crf.getCrfId() == null || crf.getCrfId().isEmpty()) {
            crf.setCrfId(generateCRFId());
        }

        // Validate unique CRF ID
        if (crfRepository.existsByCrfId(crf.getCrfId())) {
            throw new RuntimeException("CRF ID already exists: " + crf.getCrfId());
        }

        // Set default status if not provided
        if (crf.getStatus() == null) {
            crf.setStatus("draft");
        }

        // Set reception date if not provided
        if (crf.getReceptionDate() == null) {
            crf.setReceptionDate(LocalDateTime.now());
        }

        CRF savedCRF = crfRepository.save(crf);

        // Create samples for the CRF
        if (crf.getNumberOfSamples() != null && crf.getNumberOfSamples() > 0) {
            createSamplesForCRF(savedCRF);
        }

        return savedCRF;
    }

    @Transactional
    public CRF updateCRF(Long id, CRF crfDetails) {
        CRF crf = getCRFById(id);

        // Update fields
        if (crfDetails.getCustomer() != null) crf.setCustomer(crfDetails.getCustomer());
        if (crfDetails.getAddress() != null) crf.setAddress(crfDetails.getAddress());
        if (crfDetails.getContact() != null) crf.setContact(crfDetails.getContact());
        if (crfDetails.getEmail() != null) crf.setEmail(crfDetails.getEmail());
        if (crfDetails.getSampleType() != null) crf.setSampleType(crfDetails.getSampleType());
        if (crfDetails.getTestParameters() != null) crf.setTestParameters(crfDetails.getTestParameters());
        if (crfDetails.getNumberOfSamples() != null) crf.setNumberOfSamples(crfDetails.getNumberOfSamples());
        if (crfDetails.getSamplingType() != null) crf.setSamplingType(crfDetails.getSamplingType());
        if (crfDetails.getReceivedBy() != null) crf.setReceivedBy(crfDetails.getReceivedBy());
        if (crfDetails.getSignature() != null) crf.setSignature(crfDetails.getSignature());
        if (crfDetails.getPriority() != null) crf.setPriority(crfDetails.getPriority());
        if (crfDetails.getStatus() != null) crf.setStatus(crfDetails.getStatus());
        if (crfDetails.getSampleImages() != null) crf.setSampleImages(crfDetails.getSampleImages());

        return crfRepository.save(crf);
    }

    @Transactional
    public CRF updateCRFStatus(Long id, String status) {
        CRF crf = getCRFById(id);
        crf.setStatus(status);
        return crfRepository.save(crf);
    }

    @Transactional
    public void deleteCRF(Long id) {
        CRF crf = getCRFById(id);
        crfRepository.delete(crf);
    }

    public Long countByStatus(String status) {
        return crfRepository.countByStatus(status);
    }

    private String generateCRFId() {
        long count = crfRepository.count();
        return String.format("CRF-%04d", count + 1);
    }

    private void createSamplesForCRF(CRF crf) {
        for (int i = 1; i <= crf.getNumberOfSamples(); i++) {
            Sample sample = new Sample();
            sample.setSampleId(crf.getCrfId() + "-" + String.format("%02d", i));
            sample.setCrf(crf);
            sample.setDescription("Sample " + i);
            sample.setStatus("pending");
            sampleRepository.save(sample);
        }
    }
}
