package com.lindel.lindel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chemists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chemist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String email;
    private String specialization;
    
    @Column(nullable = false)
    private Integer activeTasks = 0;
    
    @Column(nullable = false)
    private Integer completedThisWeek = 0;
    
    @Column(nullable = false)
    private Integer completedThisMonth = 0;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
