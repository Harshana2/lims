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
@Table(name = "crfs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CRF {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String crfId; // e.g., "CRF-001"
    
    @Column(nullable = false)
    private String crfType; // CS (Customer Sample) or LS (Lab Service)
    
    @Column(nullable = false)
    private String customer;
    
    private String address;
    private String contact;
    private String email;
    
    @Column(nullable = false)
    private String sampleType;
    
    @ElementCollection
    @CollectionTable(name = "crf_test_parameters", joinColumns = @JoinColumn(name = "crf_id"))
    @Column(name = "parameter")
    private List<String> testParameters = new ArrayList<>();
    
    @Column(nullable = false)
    private Integer numberOfSamples;
    
    private String samplingType; // One Time, Monthly, Quarterly, Annually
    
    @Column(nullable = false)
    private LocalDateTime receptionDate;
    
    private String receivedBy;
    
    @Lob
    @Column(length = 10000)
    private String signature; // Base64 encoded signature
    
    @Column(nullable = false)
    private String priority; // Normal, Urgent, Rush
    
    @Column(nullable = false)
    private String status; // draft, submitted, assigned, testing, review, approved, completed
    
    private String quotationRef;
    
    @ElementCollection
    @CollectionTable(name = "crf_sample_images", joinColumns = @JoinColumn(name = "crf_id"))
    @Column(name = "image", length = 100000)
    private List<String> sampleImages = new ArrayList<>();
    
    @OneToMany(mappedBy = "crf", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sample> samples = new ArrayList<>();
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
