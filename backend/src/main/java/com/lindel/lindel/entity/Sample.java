package com.lindel.lindel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "samples")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sample {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String sampleId; // e.g., "SMP-001-01"
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crf_id", nullable = false)
    private CRF crf;
    
    @Column(nullable = false)
    private String description;
    
    private String submissionDetail;
    
    @Column(nullable = false)
    private String status; // pending, assigned, testing, completed
    
    private String assignedTo; // Chemist name
    
    @ElementCollection
    @CollectionTable(name = "sample_test_values", joinColumns = @JoinColumn(name = "sample_id"))
    @MapKeyColumn(name = "parameter")
    @Column(name = "value")
    private Map<String, String> testValues = new HashMap<>();
    
    @ElementCollection
    @CollectionTable(name = "sample_test_status", joinColumns = @JoinColumn(name = "sample_id"))
    @MapKeyColumn(name = "parameter")
    @Column(name = "status")
    private Map<String, String> testStatus = new HashMap<>(); // pending, completed
    
    private LocalDateTime assignedDate;
    private LocalDateTime completedDate;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
