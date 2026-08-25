package com.sunrisedental.repository;

import com.sunrisedental.entity.Bill;
import com.sunrisedental.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    @Query("""
            SELECT b FROM Bill b
            WHERE (:search IS NULL OR :search = ''
                   OR LOWER(b.patient.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(b.receiptNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(b.appointment.appointmentNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
              AND (:status IS NULL OR b.paymentStatus = :status)
            """)
    Page<Bill> findFilteredAndSearched(
            @Param("search") String search,
            @Param("status") PaymentStatus status,
            Pageable pageable);

    Optional<Bill> findByReceiptNumber(String receiptNumber);

    boolean existsByAppointmentId(Long appointmentId);

    @Query("""
            SELECT SUM(b.total) FROM Bill b
            WHERE b.paymentStatus = 'PAID'
              AND b.createdAt >= :startOfDay
              AND b.createdAt <= :endOfDay
            """)
    BigDecimal sumRevenueForPeriod(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);
}
