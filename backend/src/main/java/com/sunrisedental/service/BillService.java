package com.sunrisedental.service;

import com.sunrisedental.dto.AppointmentBillingInfo;
import com.sunrisedental.dto.BillRequest;
import com.sunrisedental.dto.BillResponse;
import com.sunrisedental.dto.PagedResponse;

import java.math.BigDecimal;

public interface BillService {

    AppointmentBillingInfo getAppointmentBillingInfo(Long appointmentId);

    BillResponse calculateBill(Long appointmentId, BigDecimal consultationFee);

    BillResponse saveBill(BillRequest request);

    PagedResponse<BillResponse> getAllBills(
            String search,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir);

    BillResponse getBillById(Long id);
}
