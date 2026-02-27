-- Create report_templates table
CREATE TABLE IF NOT EXISTS report_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL,
    
    -- Header Section
    header_content TEXT,
    include_company_logo BOOLEAN DEFAULT TRUE,
    include_lab_details BOOLEAN DEFAULT TRUE,
    
    -- Report Body Configuration
    include_crf_details BOOLEAN DEFAULT TRUE,
    include_sample_details BOOLEAN DEFAULT TRUE,
    include_test_results BOOLEAN DEFAULT TRUE,
    include_test_methods BOOLEAN DEFAULT TRUE,
    include_chemist_info BOOLEAN DEFAULT TRUE,
    
    -- Footer Section
    footer_content TEXT,
    include_signatures BOOLEAN DEFAULT TRUE,
    include_page_numbers BOOLEAN DEFAULT TRUE,
    include_generated_date BOOLEAN DEFAULT TRUE,
    
    -- Layout & Styling
    page_size VARCHAR(20) DEFAULT 'A4',
    orientation VARCHAR(20) DEFAULT 'portrait',
    custom_css TEXT,
    
    -- Additional Sections
    additional_notes TEXT,
    disclaimer TEXT,
    
    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index on template_type for faster queries
CREATE INDEX idx_report_templates_type ON report_templates(template_type);

-- Create index on is_active for faster queries
CREATE INDEX idx_report_templates_active ON report_templates(is_active);

-- Create index on is_default for faster queries
CREATE INDEX idx_report_templates_default ON report_templates(is_default);

-- Insert a default standard template
INSERT INTO report_templates (
    name,
    description,
    template_type,
    header_content,
    footer_content,
    disclaimer,
    is_default,
    is_active,
    created_by
) VALUES (
    'Standard Lab Report',
    'Default template for laboratory test reports',
    'standard',
    'Laboratory Test Report',
    'This report is generated electronically and is valid without signature.',
    'The results relate only to the samples tested. This report shall not be reproduced except in full, without written approval of the laboratory.',
    TRUE,
    TRUE,
    'system'
);

-- Insert a summary template
INSERT INTO report_templates (
    name,
    description,
    template_type,
    header_content,
    footer_content,
    include_test_methods,
    include_chemist_info,
    is_default,
    is_active,
    created_by
) VALUES (
    'Summary Report',
    'Condensed summary template for quick reports',
    'summary',
    'Test Results Summary',
    'For detailed information, please request the full report.',
    FALSE,
    FALSE,
    FALSE,
    TRUE,
    'system'
);

-- Insert a custom detailed template
INSERT INTO report_templates (
    name,
    description,
    template_type,
    header_content,
    footer_content,
    additional_notes,
    disclaimer,
    is_default,
    is_active,
    created_by
) VALUES (
    'Detailed Analysis Report',
    'Comprehensive template with all details and analysis',
    'custom',
    'Comprehensive Laboratory Analysis Report',
    'Prepared by: Laboratory Information Management System (LIMS)',
    'All tests were performed according to standard operating procedures and internationally recognized methods.',
    'The laboratory assumes no responsibility for sampling procedures and specimen handling practices employed by external parties. Results are valid only for the samples as received.',
    FALSE,
    TRUE,
    'system'
);
