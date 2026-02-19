package com.lindel.lindel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "environmental_sampling")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentalSampling {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long crfId; // Reference to CRF
    
    @Column(nullable = false)
    private String mapType; // Floor Plan, Site Map, etc.
    
    @Lob
    @Column(nullable = false, length = 50000)
    private String samplingPointsData; // JSON data with coordinates and details
    
    @Lob
    @Column(length = 100000)
    private String mapImage; // Base64 encoded map/floor plan image
    
    private String submittedBy;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;
}
