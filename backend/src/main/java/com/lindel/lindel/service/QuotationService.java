package com.lindel.lindel.service;

import com.lindel.lindel.entity.Quotation;
import com.lindel.lindel.repository.QuotationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;

    public List<Quotation> getAllQuotations() {
        return quotationRepository.findAll();
    }

    public Quotation getQuotationById(Long id) {
        return quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found with id: " + id));
    }

    public Quotation getQuotationByQuotationId(String quotationId) {
        return quotationRepository.findByQuotationId(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found with quotationId: " + quotationId));
    }

    public List<Quotation> getQuotationsByRequestId(Long requestId) {
        return quotationRepository.findByRequestId(requestId);
    }

    public List<Quotation> getQuotationsByStatus(String status) {
        return quotationRepository.findByStatus(status);
    }

    @Transactional
    public Quotation createQuotation(Quotation quotation) {
        // Generate Quotation ID if not provided
        if (quotation.getQuotationId() == null || quotation.getQuotationId().isEmpty()) {
            quotation.setQuotationId(generateQuotationId());
        }

        // Validate unique Quotation ID
        if (quotationRepository.existsByQuotationId(quotation.getQuotationId())) {
            throw new RuntimeException("Quotation ID already exists: " + quotation.getQuotationId());
        }

        // Set default status
        if (quotation.getStatus() == null) {
            quotation.setStatus("draft");
        }

        return quotationRepository.save(quotation);
    }

    @Transactional
    public Quotation updateQuotation(Long id, Quotation quotationDetails) {
        Quotation quotation = getQuotationById(id);

        if (quotationDetails.getCustomer() != null) quotation.setCustomer(quotationDetails.getCustomer());
        if (quotationDetails.getItems() != null) quotation.setItems(quotationDetails.getItems());
        if (quotationDetails.getSubtotal() != null) quotation.setSubtotal(quotationDetails.getSubtotal());
        if (quotationDetails.getTax() != null) quotation.setTax(quotationDetails.getTax());
        if (quotationDetails.getTotal() != null) quotation.setTotal(quotationDetails.getTotal());
        if (quotationDetails.getStatus() != null) quotation.setStatus(quotationDetails.getStatus());
        if (quotationDetails.getNotes() != null) quotation.setNotes(quotationDetails.getNotes());
        if (quotationDetails.getPreparedBy() != null) quotation.setPreparedBy(quotationDetails.getPreparedBy());
        if (quotationDetails.getApprovedBy() != null) quotation.setApprovedBy(quotationDetails.getApprovedBy());

        return quotationRepository.save(quotation);
    }

    @Transactional
    public Quotation updateQuotationStatus(Long id, String status) {
        Quotation quotation = getQuotationById(id);
        quotation.setStatus(status);

        if ("sent".equals(status) && quotation.getSentDate() == null) {
            quotation.setSentDate(LocalDateTime.now());
        }

        if ("approved".equals(status) && quotation.getApprovedDate() == null) {
            quotation.setApprovedDate(LocalDateTime.now());
        }

        return quotationRepository.save(quotation);
    }

    @Transactional
    public void deleteQuotation(Long id) {
        Quotation quotation = getQuotationById(id);
        quotationRepository.delete(quotation);
    }

    public Long countByStatus(String status) {
        return quotationRepository.countByStatus(status);
    }

    private String generateQuotationId() {
        long count = quotationRepository.count();
        return String.format("QTN-%04d", count + 1);
    }
}
