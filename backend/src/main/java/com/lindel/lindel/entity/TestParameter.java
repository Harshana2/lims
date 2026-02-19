package com.lindel.lindel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_parameters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestParameter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String unit;
    private String method;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal defaultPrice;
    
    @ElementCollection
    @CollectionTable(name = "parameter_sample_types", joinColumns = @JoinColumn(name = "parameter_id"))
    @Column(name = "sample_type")
    private List<String> applicableSampleTypes = new ArrayList<>();
    
    private String category; // Chemical, Physical, Microbiological, etc.
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Lob
    @Column(length = 2000)
    private String description;
    
    private String accreditation; // ISO, EPA, etc.
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
