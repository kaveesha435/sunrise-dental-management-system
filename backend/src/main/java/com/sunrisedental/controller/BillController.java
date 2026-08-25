package com.sunrisedental.controller;

import com.sunrisedental.dto.ApiResponse;
import com.sunrisedental.dto.AppointmentBillingInfo;
import com.sunrisedental.dto.BillRequest;
import com.sunrisedental.dto.BillResponse;
import com.sunrisedental.dto.PagedResponse;
import com.sunrisedental.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<ApiResponse<AppointmentBillingInfo>> getAppointmentBillingInfo(
            @PathVariable Long appointmentId) {
        AppointmentBillingInfo info = billService.getAppointmentBillingInfo(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(info));
    }

    @GetMapping("/calculate")
    public ResponseEntity<ApiResponse<BillResponse>> calculateBill(
            @RequestParam Long appointmentId,
            @RequestParam(required = false) BigDecimal consultationFee) {
        BillResponse calculated = billService.calculateBill(appointmentId, consultationFee);
        return ResponseEntity.ok(ApiResponse.success(calculated));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BillResponse>> saveBill(
            @Valid @RequestBody BillRequest request) {
        BillResponse saved = billService.saveBill(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bill saved successfully", saved));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<BillResponse>>> getAllBills(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<BillResponse> result = billService.getAllBills(search, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(@PathVariable Long id) {
        BillResponse bill = billService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.success(bill));
    }
}
