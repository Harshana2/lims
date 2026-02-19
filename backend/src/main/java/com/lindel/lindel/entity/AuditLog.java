package com.lindel.lindel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    
    @Column(nullable = false)
    private String module; // CRF, Request, Quotation, User Management, etc.
    
    @Lob
    @Column(length = 5000)
    private String details;
    
    private String ipAddress;
    
    @Column(nullable = false)
    private String status; // Success, Failed
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
