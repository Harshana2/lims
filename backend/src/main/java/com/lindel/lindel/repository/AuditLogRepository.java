package com.lindel.lindel.repository;

import com.lindel.lindel.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    List<AuditLog> findByUsername(String username);
    
    List<AuditLog> findByModule(String module);
    
    List<AuditLog> findByAction(String action);
    
    List<AuditLog> findByStatus(String status);
    
    List<AuditLog> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    List<AuditLog> findByModuleAndStatus(String module, String status);
}
