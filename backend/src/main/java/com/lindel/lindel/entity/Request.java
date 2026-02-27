package com.lindel.lindel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Request {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String requestId; // e.g., "REQ-001"
    
    @Column(nullable = false)
    private String customer;
    
    private String contact;
    private String email;
    private String address;
    
    @Column(nullable = false)
    private String sampleType;
    
    @ElementCollection
    @CollectionTable(name = "request_parameters", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "parameter")
    private List<String> parameters = new ArrayList<>();
    
    @Column(nullable = false)
    private Integer numberOfSamples;
    
    @Column(nullable = false)
    private String priority; // Normal, Urgent, Rush
    
    @Column(nullable = false)
    private String status; // pending, quoted, approved, rejected, converted
    
    private Long quotationId; // Reference to generated quotation
    private Long crfId; // Reference to CRF if converted
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
