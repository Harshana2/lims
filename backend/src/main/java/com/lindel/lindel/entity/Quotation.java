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
@Table(name = "quotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quotation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String quotationId; // e.g., "QTN-001"
    
    @Column(nullable = false)
    private Long requestId; // Reference to Request
    
    @Column(nullable = false)
    private String customer;
    
    @ElementCollection
    @CollectionTable(name = "quotation_items", joinColumns = @JoinColumn(name = "quotation_id"))
    private List<QuotationItem> items = new ArrayList<>();
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal tax;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Column(nullable = false)
    private String status; // draft, sent, approved, rejected
    
    private LocalDateTime sentDate;
    private LocalDateTime approvedDate;
    
    @Lob
    @Column(length = 5000)
    private String notes;
    
    private String preparedBy;
    private String approvedBy;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
class QuotationItem {
    private String parameter;
    private Integer quantity;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal totalPrice;
}
