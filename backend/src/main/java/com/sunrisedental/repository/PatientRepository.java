package com.sunrisedental.repository;

import com.sunrisedental.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for {@link Patient} entities.
 *
 * All queries return paginated results so the API never loads the entire
 * patient table into memory.
 */
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /**
     * Unified search across patient name, contact number, and numeric patient ID.
     *
     * <p>The {@code CAST(p.id AS string)} allows searching by patient ID as a
     * string prefix (e.g. "12" matches patient 12, 120, 121…).
     *
     * @param search   search term (case-insensitive)
     * @param pageable paging and sorting
     * @return paged results
     */
    @Query("""
            SELECT p FROM Patient p
            WHERE LOWER(p.fullName)     LIKE LOWER(CONCAT('%', :search, '%'))
               OR p.contactNumber       LIKE CONCAT('%', :search, '%')
               OR CAST(p.id AS string)  LIKE CONCAT(:search, '%')
            """)
    Page<Patient> search(@Param("search") String search, Pageable pageable);

    /**
     * Filtered + searched query — combines status filter with unified search.
     *
     * @param status   patient status (ACTIVE / INACTIVE)
     * @param search   search term
     * @param pageable paging and sorting
     * @return paged results
     */
    @Query("""
            SELECT p FROM Patient p
            WHERE p.status = :status
              AND (
                    LOWER(p.fullName)    LIKE LOWER(CONCAT('%', :search, '%'))
                 OR p.contactNumber      LIKE CONCAT('%', :search, '%')
                 OR CAST(p.id AS string) LIKE CONCAT(:search, '%')
              )
            """)
    Page<Patient> searchByStatus(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable);

    /**
     * Filter by status only (no search term).
     */
    Page<Patient> findByStatus(String status, Pageable pageable);

    /**
     * Count patients by status (used for dashboard summary cards).
     */
    long countByStatus(String status);

    /**
     * Count patients created in a given month/year for the "New This Month" card.
     */
    @Query("""
            SELECT COUNT(p) FROM Patient p
            WHERE YEAR(p.createdAt)  = :year
              AND MONTH(p.createdAt) = :month
            """)
    long countCreatedInMonth(@Param("year") int year, @Param("month") int month);

    /**
     * Check for duplicate contact number (used for duplicate-warning on registration).
     */
    boolean existsByContactNumber(String contactNumber);

    /**
     * Check duplicate contact excluding current patient (used during updates).
     */
    boolean existsByContactNumberAndIdNot(String contactNumber, Long id);
}
