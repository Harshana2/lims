package com.lindel.lindel.config;

import com.lindel.lindel.entity.*;
import com.lindel.lindel.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final ChemistRepository chemistRepository;
    private final TestParameterRepository testParameterRepository;
    private final CRFRepository crfRepository;
    private final RequestRepository requestRepository;
    private final QuotationRepository quotationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            if (userRepository.count() == 0) {
                log.info("Seeding database with initial data...");
                seedUsers();
                seedChemists();
                seedTestParameters();
                seedRequests();
                seedQuotations();
                seedCRFs();
                seedAuditLogs();
                log.info("Database seeding completed!");
            } else {
                log.info("Database already contains data. Skipping seeding.");
            }
        };
    }

    private void seedUsers() {
        List<User> users = Arrays.asList(
                createUser("admin", "Admin User", "admin@lindel.com", "ADMIN"),
                createUser("chemist1", "John Smith", "john@lindel.com", "CHEMIST"),
                createUser("chemist2", "Sarah Johnson", "sarah@lindel.com", "CHEMIST"),
                createUser("manager", "Mike Manager", "manager@lindel.com", "MANAGER"),
                createUser("user", "Demo User", "user@lindel.com", "USER")
        );
        userRepository.saveAll(users);
        log.info("Created {} users", users.size());
    }

    private User createUser(String username, String name, String email, String role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setActive(true);
        return user;
    }

    private void seedChemists() {
        List<Chemist> chemists = Arrays.asList(
                createChemist("John Smith", "john@lindel.com", "Chemical Analysis", 3, 8, 32),
                createChemist("Sarah Johnson", "sarah@lindel.com", "Microbiological Testing", 5, 12, 45),
                createChemist("Michael Chen", "michael@lindel.com", "Physical Testing", 2, 6, 28),
                createChemist("Emily Brown", "emily@lindel.com", "Environmental Sampling", 4, 10, 38),
                createChemist("David Lee", "david@lindel.com", "Quality Control", 1, 4, 18),
                createChemist("Lisa Wang", "lisa@lindel.com", "Chemical Analysis", 6, 15, 52)
        );
        chemistRepository.saveAll(chemists);
        log.info("Created {} chemists", chemists.size());
    }

    private Chemist createChemist(String name, String email, String specialization, 
                                   int activeTasks, int completedThisWeek, int completedThisMonth) {
        Chemist chemist = new Chemist();
        chemist.setName(name);
        chemist.setEmail(email);
        chemist.setSpecialization(specialization);
        chemist.setActiveTasks(activeTasks);
        chemist.setCompletedThisWeek(completedThisWeek);
        chemist.setCompletedThisMonth(completedThisMonth);
        chemist.setActive(true);
        return chemist;
    }

    private void seedTestParameters() {
        List<TestParameter> parameters = Arrays.asList(
                createParameter("pH", "pH units", "ASTM D1293", new BigDecimal("50.00"), 
                        Arrays.asList("Water", "Wastewater", "Soil"), "Chemical", "ISO 17025"),
                createParameter("Conductivity", "μS/cm", "ASTM D1125", new BigDecimal("75.00"), 
                        Arrays.asList("Water", "Wastewater"), "Physical", "ISO 17025"),
                createParameter("Total Dissolved Solids", "mg/L", "ASTM D5907", new BigDecimal("100.00"), 
                        Arrays.asList("Water", "Wastewater"), "Chemical", "ISO 17025"),
                createParameter("Total Coliform", "MPN/100mL", "APHA 9221", new BigDecimal("150.00"), 
                        Arrays.asList("Water", "Food"), "Microbiological", "ISO 17025"),
                createParameter("E. coli", "MPN/100mL", "APHA 9221", new BigDecimal("150.00"), 
                        Arrays.asList("Water", "Food"), "Microbiological", "ISO 17025"),
                createParameter("Heavy Metals (Lead)", "mg/L", "EPA 200.8", new BigDecimal("200.00"), 
                        Arrays.asList("Water", "Soil", "Food"), "Chemical", "EPA"),
                createParameter("Turbidity", "NTU", "ASTM D1889", new BigDecimal("60.00"), 
                        Arrays.asList("Water", "Wastewater"), "Physical", "ISO 17025"),
                createParameter("BOD", "mg/L", "ASTM D5210", new BigDecimal("120.00"), 
                        Arrays.asList("Wastewater"), "Chemical", "ISO 17025"),
                createParameter("COD", "mg/L", "ASTM D1252", new BigDecimal("120.00"), 
                        Arrays.asList("Wastewater"), "Chemical", "ISO 17025"),
                createParameter("Nitrogen (Total)", "mg/L", "EPA 351.2", new BigDecimal("180.00"), 
                        Arrays.asList("Water", "Wastewater", "Soil"), "Chemical", "EPA")
        );
        testParameterRepository.saveAll(parameters);
        log.info("Created {} test parameters", parameters.size());
    }

    private TestParameter createParameter(String name, String unit, String method, BigDecimal price,
                                          List<String> sampleTypes, String category, String accreditation) {
        TestParameter param = new TestParameter();
        param.setName(name);
        param.setUnit(unit);
        param.setMethod(method);
        param.setDefaultPrice(price);
        param.setApplicableSampleTypes(sampleTypes);
        param.setCategory(category);
        param.setActive(true);
        param.setAccreditation(accreditation);
        param.setDescription("Testing for " + name + " using " + method);
        return param;
    }

    private void seedRequests() {
        List<Request> requests = Arrays.asList(
                createRequest("REQ-001", "ABC Industries", "Water", 
                        Arrays.asList("pH", "Conductivity", "TDS"), 5, "Normal", "pending"),
                createRequest("REQ-002", "XYZ Corporation", "Food", 
                        Arrays.asList("Total Coliform", "E. coli"), 3, "Urgent", "quoted"),
                createRequest("REQ-003", "Green Solutions", "Wastewater", 
                        Arrays.asList("BOD", "COD", "pH"), 10, "Rush", "approved")
        );
        requestRepository.saveAll(requests);
        log.info("Created {} requests", requests.size());
    }

    private Request createRequest(String requestId, String customer, String sampleType,
                                   List<String> parameters, int samples, String priority, String status) {
        Request request = new Request();
        request.setRequestId(requestId);
        request.setCustomer(customer);
        request.setContact("+1234567890");
        request.setEmail(customer.toLowerCase().replace(" ", "") + "@example.com");
        request.setSampleType(sampleType);
        request.setParameters(parameters);
        request.setNumberOfSamples(samples);
        request.setPriority(priority);
        request.setStatus(status);
        request.setNotes("Sample request for testing services");
        return request;
    }

    private void seedQuotations() {
        List<Quotation> quotations = Arrays.asList(
                createQuotation("QTN-001", 2L, "XYZ Corporation", "sent"),
                createQuotation("QTN-002", 3L, "Green Solutions", "approved")
        );
        quotationRepository.saveAll(quotations);
        log.info("Created {} quotations", quotations.size());
    }

    private Quotation createQuotation(String quotationId, Long requestId, String customer, String status) {
        Quotation quotation = new Quotation();
        quotation.setQuotationId(quotationId);
        quotation.setRequestId(requestId);
        quotation.setCustomer(customer);
        quotation.setSubtotal(new BigDecimal("1500.00"));
        quotation.setTax(new BigDecimal("150.00"));
        quotation.setTotal(new BigDecimal("1650.00"));
        quotation.setStatus(status);
        quotation.setPreparedBy("admin");
        quotation.setNotes("Quotation for requested testing services");
        if ("sent".equals(status) || "approved".equals(status)) {
            quotation.setSentDate(LocalDateTime.now().minusDays(2));
        }
        if ("approved".equals(status)) {
            quotation.setApprovedDate(LocalDateTime.now().minusDays(1));
            quotation.setApprovedBy("manager");
        }
        return quotation;
    }

    private void seedCRFs() {
        List<CRF> crfs = Arrays.asList(
                createCRF("CRF-001", "CS", "Acme Water Treatment", "Water", 
                        Arrays.asList("pH", "Conductivity", "TDS", "Turbidity"), 
                        5, "submitted", "Normal", "John Smith"),
                createCRF("CRF-002", "CS", "Fresh Food Factory", "Food", 
                        Arrays.asList("Total Coliform", "E. coli"), 
                        3, "assigned", "Urgent", "Sarah Johnson"),
                createCRF("CRF-003", "LS", "City Wastewater Plant", "Wastewater", 
                        Arrays.asList("BOD", "COD", "pH", "Total Nitrogen"), 
                        8, "testing", "Rush", "Michael Chen"),
                createCRF("CRF-004", "CS", "Industrial Solutions Ltd", "Soil", 
                        Arrays.asList("Heavy Metals (Lead)", "pH"), 
                        4, "review", "Normal", "Emily Brown"),
                createCRF("CRF-005", "CS", "Clean Water Initiative", "Water", 
                        Arrays.asList("pH", "E. coli", "Turbidity"), 
                        6, "completed", "Normal", "David Lee")
        );
        crfRepository.saveAll(crfs);
        log.info("Created {} CRFs", crfs.size());
    }

    private CRF createCRF(String crfId, String crfType, String customer, String sampleType,
                          List<String> parameters, int samples, String status, String priority, String receivedBy) {
        CRF crf = new CRF();
        crf.setCrfId(crfId);
        crf.setCrfType(crfType);
        crf.setCustomer(customer);
        crf.setAddress("123 Main Street, City, State 12345");
        crf.setContact("+1234567890");
        crf.setEmail(customer.toLowerCase().replace(" ", "") + "@example.com");
        crf.setSampleType(sampleType);
        crf.setTestParameters(parameters);
        crf.setNumberOfSamples(samples);
        crf.setSamplingType("One Time");
        crf.setReceptionDate(LocalDateTime.now().minusDays(5));
        crf.setReceivedBy(receivedBy);
        crf.setPriority(priority);
        crf.setStatus(status);
        return crf;
    }

    private void seedAuditLogs() {
        List<AuditLog> logs = Arrays.asList(
                createAuditLog("admin", "LOGIN", "Authentication", "User logged in successfully", "Success"),
                createAuditLog("admin", "CREATE", "CRF Management", "Created CRF-001", "Success"),
                createAuditLog("chemist1", "UPDATE", "Sample Testing", "Updated test values for sample SMP-001-01", "Success"),
                createAuditLog("manager", "APPROVE", "Quotation Management", "Approved quotation QTN-002", "Success"),
                createAuditLog("admin", "CREATE", "User Management", "Created new user account", "Success")
        );
        auditLogRepository.saveAll(logs);
        log.info("Created {} audit logs", logs.size());
    }

    private AuditLog createAuditLog(String username, String action, String module, String details, String status) {
        AuditLog log = new AuditLog();
        log.setUsername(username);
        log.setAction(action);
        log.setModule(module);
        log.setDetails(details);
        log.setIpAddress("192.168.1.100");
        log.setStatus(status);
        return log;
    }
}
