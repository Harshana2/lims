package com.lindel.lindel.service;

import com.lindel.lindel.entity.Request;
import com.lindel.lindel.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public Request getRequestById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + id));
    }

    public Request getRequestByRequestId(String requestId) {
        return requestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with requestId: " + requestId));
    }

    public List<Request> getRequestsByStatus(String status) {
        return requestRepository.findByStatus(status);
    }

    public List<Request> getRequestsByCustomer(String customer) {
        return requestRepository.findByCustomerContainingIgnoreCase(customer);
    }

    @Transactional
    public Request createRequest(Request request) {
        // Generate Request ID if not provided
        if (request.getRequestId() == null || request.getRequestId().isEmpty()) {
            request.setRequestId(generateRequestId());
        }

        // Validate unique Request ID
        if (requestRepository.existsByRequestId(request.getRequestId())) {
            throw new RuntimeException("Request ID already exists: " + request.getRequestId());
        }

        // Set default status
        if (request.getStatus() == null) {
            request.setStatus("pending");
        }

        return requestRepository.save(request);
    }

    @Transactional
    public Request updateRequest(Long id, Request requestDetails) {
        Request request = getRequestById(id);

        if (requestDetails.getCustomer() != null) request.setCustomer(requestDetails.getCustomer());
        if (requestDetails.getContact() != null) request.setContact(requestDetails.getContact());
        if (requestDetails.getEmail() != null) request.setEmail(requestDetails.getEmail());
        if (requestDetails.getAddress() != null) request.setAddress(requestDetails.getAddress());
        if (requestDetails.getSampleType() != null) request.setSampleType(requestDetails.getSampleType());
        if (requestDetails.getParameters() != null) request.setParameters(requestDetails.getParameters());
        if (requestDetails.getNumberOfSamples() != null) request.setNumberOfSamples(requestDetails.getNumberOfSamples());
        if (requestDetails.getPriority() != null) request.setPriority(requestDetails.getPriority());
        if (requestDetails.getStatus() != null) request.setStatus(requestDetails.getStatus());
        if (requestDetails.getNotes() != null) request.setNotes(requestDetails.getNotes());
        if (requestDetails.getQuotationId() != null) request.setQuotationId(requestDetails.getQuotationId());
        if (requestDetails.getCrfId() != null) request.setCrfId(requestDetails.getCrfId());

        return requestRepository.save(request);
    }

    @Transactional
    public Request updateRequestStatus(Long id, String status) {
        Request request = getRequestById(id);
        request.setStatus(status);
        return requestRepository.save(request);
    }

    @Transactional
    public void deleteRequest(Long id) {
        Request request = getRequestById(id);
        requestRepository.delete(request);
    }

    public Long countByStatus(String status) {
        return requestRepository.countByStatus(status);
    }

    private String generateRequestId() {
        long count = requestRepository.count();
        return String.format("REQ-%04d", count + 1);
    }
}
