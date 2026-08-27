package com.sunrisedental.repository;

import com.sunrisedental.entity.Appointment;
import com.sunrisedental.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
            SELECT a FROM Appointment a
            WHERE (:search IS NULL OR :search = '' 
                   OR LOWER(a.patient.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(a.dentist.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(a.appointmentNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
              AND (CAST(:date AS date) IS NULL OR a.appointmentDate = :date)
              AND (:patientId IS NULL OR a.patient.id = :patientId)
              AND (:dentistId IS NULL OR a.dentist.id = :dentistId)
              AND (:treatmentId IS NULL OR a.treatment.id = :treatmentId)
              AND (:status IS NULL OR a.status = :status)
            """)
    Page<Appointment> findFilteredAndSearched(
            @Param("search") String search,
            @Param("date") LocalDate date,
            @Param("patientId") Long patientId,
            @Param("dentistId") Long dentistId,
            @Param("treatmentId") Long treatmentId,
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    List<Appointment> findByDentistIdAndAppointmentDateAndStatusNot(
            Long dentistId, LocalDate date, AppointmentStatus status);

    boolean existsByDentistId(Long dentistId);

    boolean existsByTreatmentId(Long treatmentId);

    long countByDentistIdAndAppointmentDateAndStatusNot(
            Long dentistId, LocalDate date, AppointmentStatus status);

    List<Appointment> findByPatientIdAndAppointmentDateAndStatusNot(
            Long patientId, LocalDate date, AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date AND a.status <> 'CANCELLED'")
    long countTodayAppointments(@Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    long countByStatus(@Param("status") AppointmentStatus status);

    @Query("""
            SELECT a FROM Appointment a
            WHERE (a.appointmentDate > :date OR (a.appointmentDate = :date AND a.appointmentTime >= :time))
              AND a.status <> 'CANCELLED'
            ORDER BY a.appointmentDate ASC, a.appointmentTime ASC
            """)
    List<Appointment> findUpcomingAppointments(@Param("date") LocalDate date, @Param("time") java.time.LocalTime time, Pageable pageable);

    @Query("""
            SELECT a FROM Appointment a
            WHERE a.appointmentDate = :date
            ORDER BY a.appointmentTime ASC
            """)
    List<Appointment> findTodayAppointmentsList(@Param("date") LocalDate date);

    @Query("""
            SELECT a.appointmentDate, COUNT(a) FROM Appointment a
            WHERE a.appointmentDate BETWEEN :startDate AND :endDate
              AND a.status <> 'CANCELLED'
            GROUP BY a.appointmentDate
            """)
    List<Object[]> getWeeklyStats(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT COUNT(a) FROM Appointment a
            WHERE (CAST(:startDate AS date) IS NULL OR a.appointmentDate >= :startDate)
              AND (CAST(:endDate AS date) IS NULL OR a.appointmentDate <= :endDate)
              AND (:dentistId IS NULL OR a.dentist.id = :dentistId)
              AND (:treatmentId IS NULL OR a.treatment.id = :treatmentId)
              AND (:status IS NULL OR a.status = :status)
            """)
    long countReportAppointments(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("dentistId") Long dentistId,
            @Param("treatmentId") Long treatmentId,
            @Param("status") AppointmentStatus status);

    @Query("""
            SELECT a.treatment.name, COUNT(a), COALESCE(SUM(b.total), 0)
            FROM Appointment a
            LEFT JOIN Bill b ON b.appointment = a
            WHERE (CAST(:startDate AS date) IS NULL OR a.appointmentDate >= :startDate)
              AND (CAST(:endDate AS date) IS NULL OR a.appointmentDate <= :endDate)
              AND (:dentistId IS NULL OR a.dentist.id = :dentistId)
              AND (:treatmentId IS NULL OR a.treatment.id = :treatmentId)
              AND (:status IS NULL OR a.status = :status)
            GROUP BY a.treatment.name
            """)
    List<Object[]> getTreatmentReportData(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("dentistId") Long dentistId,
            @Param("treatmentId") Long treatmentId,
            @Param("status") AppointmentStatus status);

    @Query("""
            SELECT a.appointmentDate, COUNT(a)
            FROM Appointment a
            WHERE (CAST(:startDate AS date) IS NULL OR a.appointmentDate >= :startDate)
              AND (CAST(:endDate AS date) IS NULL OR a.appointmentDate <= :endDate)
              AND (:dentistId IS NULL OR a.dentist.id = :dentistId)
              AND (:treatmentId IS NULL OR a.treatment.id = :treatmentId)
              AND (:status IS NULL OR a.status = :status)
            GROUP BY a.appointmentDate
            ORDER BY a.appointmentDate ASC
            """)
    List<Object[]> getDailyAppointmentVolume(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("dentistId") Long dentistId,
            @Param("treatmentId") Long treatmentId,
            @Param("status") AppointmentStatus status);

    @Query("""
            SELECT a.appointmentDate, COALESCE(SUM(b.total), 0)
            FROM Appointment a
            JOIN Bill b ON b.appointment = a
            WHERE (CAST(:startDate AS date) IS NULL OR a.appointmentDate >= :startDate)
              AND (CAST(:endDate AS date) IS NULL OR a.appointmentDate <= :endDate)
              AND (:dentistId IS NULL OR a.dentist.id = :dentistId)
              AND (:treatmentId IS NULL OR a.treatment.id = :treatmentId)
              AND (:status IS NULL OR a.status = :status)
            GROUP BY a.appointmentDate
            ORDER BY a.appointmentDate ASC
            """)
    List<Object[]> getDailyRevenueTrend(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("dentistId") Long dentistId,
            @Param("treatmentId") Long treatmentId,
            @Param("status") AppointmentStatus status);

    @Query("""
            SELECT COALESCE(SUM(b.total), 0)
            FROM Appointment a
            JOIN Bill b ON b.appointment = a
            WHERE (CAST(:startDate AS date) IS NULL OR a.appointmentDate >= :startDate)
              AND (CAST(:endDate AS date) IS NULL OR a.appointmentDate <= :endDate)
              AND (:dentistId IS NULL OR a.dentist.id = :dentistId)
              AND (:treatmentId IS NULL OR a.treatment.id = :treatmentId)
              AND (:status IS NULL OR a.status = :status)
            """)
    java.math.BigDecimal getTotalRevenue(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("dentistId") Long dentistId,
            @Param("treatmentId") Long treatmentId,
            @Param("status") AppointmentStatus status);
}
