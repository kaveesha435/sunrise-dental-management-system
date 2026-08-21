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
                   OR LOWER(a.dentist) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(a.appointmentNumber) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
              AND (CAST(:date AS date) IS NULL OR a.appointmentDate = :date)
              AND (:patientId IS NULL OR a.patient.id = :patientId)
              AND (:dentist IS NULL OR :dentist = '' OR LOWER(a.dentist) = LOWER(:dentist))
              AND (:treatment IS NULL OR :treatment = '' OR LOWER(a.treatment) = LOWER(:treatment))
              AND (:status IS NULL OR a.status = :status)
            """)
    Page<Appointment> findFilteredAndSearched(
            @Param("search") String search,
            @Param("date") LocalDate date,
            @Param("patientId") Long patientId,
            @Param("dentist") String dentist,
            @Param("treatment") String treatment,
            @Param("status") AppointmentStatus status,
            Pageable pageable);

    List<Appointment> findByDentistAndAppointmentDateAndStatusNot(
            String dentist, LocalDate date, AppointmentStatus status);

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
}
