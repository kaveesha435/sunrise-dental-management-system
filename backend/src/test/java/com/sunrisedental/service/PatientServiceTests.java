package com.sunrisedental.service;

import com.sunrisedental.dto.PatientRequest;
import com.sunrisedental.dto.PatientResponse;
import com.sunrisedental.entity.Patient;
import com.sunrisedental.exception.ResourceNotFoundException;
import com.sunrisedental.repository.PatientRepository;
import com.sunrisedental.service.impl.PatientServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTests {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private Patient patient;
    private PatientRequest patientRequest;

    @BeforeEach
    void setUp() {
        patient = Patient.builder()
                .id(1L)
                .fullName("John Doe")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender("Male")
                .contactNumber("1234567890")
                .email("john@example.com")
                .address("123 Main St")
                .city("New York")
                .postalCode("10001")
                .status("ACTIVE")
                .build();

        patientRequest = new PatientRequest();
        patientRequest.setFullName("John Doe");
        patientRequest.setDateOfBirth(LocalDate.of(1990, 1, 1));
        patientRequest.setGender("Male");
        patientRequest.setContactNumber("1234567890");
        patientRequest.setEmail("john@example.com");
        patientRequest.setAddress("123 Main St");
        patientRequest.setCity("New York");
        patientRequest.setPostalCode("10001");
        patientRequest.setStatus("ACTIVE");
    }

    @Test
    void testCreatePatient_Success() {
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        PatientResponse response = patientService.create(patientRequest);

        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
        assertEquals(1L, response.getId());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void testGetPatientById_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        PatientResponse response = patientService.getById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John Doe", response.getFullName());
        verify(patientRepository, times(1)).findById(1L);
    }

    @Test
    void testGetPatientById_NotFound() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> patientService.getById(99L));
        verify(patientRepository, times(1)).findById(99L);
    }

    @Test
    void testUpdatePatient_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        patientRequest.setFullName("John Smith");
        PatientResponse response = patientService.update(1L, patientRequest);

        assertNotNull(response);
        verify(patientRepository, times(1)).findById(1L);
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void testDeletePatient_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        doNothing().when(patientRepository).delete(patient);

        assertDoesNotThrow(() -> patientService.delete(1L));

        verify(patientRepository, times(1)).findById(1L);
        verify(patientRepository, times(1)).delete(patient);
    }

    @Test
    void testDeletePatient_NotFound() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> patientService.delete(99L));

        verify(patientRepository, times(1)).findById(99L);
        verify(patientRepository, never()).delete(any());
    }
}
