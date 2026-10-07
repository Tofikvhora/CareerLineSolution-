const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

// Helper to read DB
function readData() {
  if (!fs.existsSync(DB_FILE)) {
    initDefaultData();
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, re-initializing...', err);
    return initDefaultData();
  }
}

// Helper to write DB atomically
function writeData(data) {
  const tmpFile = DB_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

// Initial seed data
function initDefaultData() {
  const salt = bcrypt.genSaltSync(10);
  const hashedAdminPassword = bcrypt.hashSync('admin123', salt);
  const hashedRecruiterPassword = bcrypt.hashSync('recruiter123', salt);

  const initialData = {
    users: [
      {
        id: 'usr_admin',
        name: 'Super Admin',
        email: 'admin@careerlinesolution.com',
        password: hashedAdminPassword,
        role: 'Admin',
        phone: '+91 7573905399',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_recruiter',
        name: 'Priya Sharma (Lead Recruiter)',
        email: 'priya@careerlinesolution.com',
        password: hashedRecruiterPassword,
        role: 'Recruiter',
        phone: '+91 9274356988',
        createdAt: new Date().toISOString()
      }
    ],
    jobs: [
      {
        id: 'job_101',
        title: 'Senior Full Stack Developer (React & Node.js)',
        category: 'IT & Software',
        company: 'Tier-1 IT Tech Firm (Client confidential)',
        location: 'Bengaluru, Karnataka',
        state: 'Karnataka',
        city: 'Bengaluru',
        jobType: 'Full-Time',
        workMode: 'Hybrid',
        experience: '4 - 7 Years',
        experienceRange: '3-5',
        salary: '₹14,00,000 - ₹22,00,000 P.A.',
        openings: 5,
        urgent: true,
        featured: true,
        status: 'Active',
        skills: ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
        description: 'We are hiring a skilled Senior Full Stack Developer to lead development of scalable enterprise web applications. You will collaborate with cross-functional teams and drive technical architecture.',
        responsibilities: '• Architect and implement robust APIs and performant UI components.\n• Collaborate with UX designers and backend specialists.\n• Optimize web applications for maximum speed and scalability.\n• Mentor junior developers and conduct code reviews.',
        requirements: '• Strong proficiency in React, Node.js, and TypeScript.\n• In-depth knowledge of RESTful API design and Microservices.\n• Experience with SQL/NoSQL databases and cloud deployments (AWS/Azure).\n• Bachelor’s or Master’s in Computer Science or equivalent.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'job_102',
        title: 'Branch Relationship Manager - Retail Banking',
        category: 'Banking & Financial Services (BFSI)',
        company: 'Leading Private Sector Bank',
        location: 'Mumbai, Maharashtra',
        state: 'Maharashtra',
        city: 'Mumbai',
        jobType: 'Full-Time',
        workMode: 'On-Site',
        experience: '3 - 6 Years',
        experienceRange: '3-5',
        salary: '₹7,50,000 - ₹12,00,000 P.A. + Incentives',
        openings: 8,
        urgent: true,
        featured: true,
        status: 'Active',
        skills: ['HNI Client Acquisition', 'Wealth Management', 'Cross-Selling', 'Portfolio Review', 'Banking Regulations'],
        description: 'Seeking dynamic Relationship Managers for high net-worth individuals (HNI) banking portfolio. Responsible for managing client portfolios and driving financial solutions.',
        responsibilities: '• Manage and expand relationships with High Net-Worth Individuals.\n• Promote mutual funds, insurance, fixed deposits, and structured products.\n• Ensure top-tier customer satisfaction and retention.\n• Achieve revenue and client growth milestones.',
        requirements: '• Relevant banking/finance sales background.\n• Strong verbal and written communication.\n• AMFI / IRDA certification is a huge plus.\n• Graduate / MBA in Finance or Marketing.',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'job_103',
        title: 'Quality Assurance & Production Engineer',
        category: 'Manufacturing & Engineering',
        company: 'Automotive & Precision Components Group',
        location: 'Pune / Chakan MIDC, Maharashtra',
        state: 'Maharashtra',
        city: 'Pune',
        jobType: 'Full-Time',
        workMode: 'On-Site',
        experience: '2 - 5 Years',
        experienceRange: '1-3',
        salary: '₹5,50,000 - ₹8,50,000 P.A.',
        openings: 4,
        urgent: false,
        featured: true,
        status: 'Active',
        skills: ['QA/QC', 'ISO 9001', 'PPAP', 'APQP', 'Six Sigma', 'AutoCAD'],
        description: 'Lead line inspection, quality assurance audits, and manufacturing defect mitigation in an automated plant.',
        responsibilities: '• Execute daily manufacturing quality inspections and audits.\n• Enforce standard operating procedures (SOP) and ISO standards.\n• Conduct Root Cause Analysis (RCA) and 8D reports for non-conformances.\n• Liaise with suppliers and internal maintenance teams.',
        requirements: '• B.E. / B.Tech or Diploma in Mechanical / Production Engineering.\n• Proven experience in automotive or industrial manufacturing.\n• Hands-on with metrology equipment and calibration.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'job_104',
        title: 'Clinical Pharmacist & Medical Operations Lead',
        category: 'Healthcare & Pharmaceuticals',
        company: 'Multi-Speciality Hospital Network',
        location: 'Hyderabad, Telangana',
        state: 'Telangana',
        city: 'Hyderabad',
        jobType: 'Full-Time',
        workMode: 'On-Site',
        experience: '2 - 4 Years',
        experienceRange: '1-3',
        salary: '₹6,00,000 - ₹9,00,000 P.A.',
        openings: 3,
        urgent: false,
        featured: false,
        status: 'Active',
        skills: ['Hospital Pharmacy', 'Drug Safety', 'NABH Protocols', 'Inventory Control', 'Prescription Audits'],
        description: 'Oversee hospital pharmacy distribution, prescription verification, and compliance with healthcare safety standards.',
        responsibilities: '• Review inpatient/outpatient prescriptions for dosage and contraindications.\n• Maintain strict NABH medication safety compliance.\n• Supervise pharmaceutical inventory and cold-chain logistics.\n• Coordinate with doctors, nurses, and hospital administration.',
        requirements: '• B.Pharm / M.Pharm / Pharm.D with state pharmacy council registration.\n• 2+ years of hospital or clinical setting experience.\n• Detail-oriented and safety-conscious.',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 'job_105',
        title: 'International BPO Customer Success Specialist (US Shift)',
        category: 'BPO / KPO / Customer Service',
        company: 'Global Customer Operations Hub',
        location: 'Gurugram / Delhi NCR',
        state: 'Delhi NCR',
        city: 'Gurugram',
        jobType: 'Full-Time',
        workMode: 'Hybrid',
        experience: '1 - 3 Years',
        experienceRange: '1-3',
        salary: '₹4,50,000 - ₹6,50,000 P.A. + Cab + Night Allowance',
        openings: 15,
        urgent: true,
        featured: true,
        status: 'Active',
        skills: ['Fluent English', 'Customer Support', 'Zendesk', 'CRM', 'Problem Solving'],
        description: 'Join a world-class customer experience team managing international clients via voice and chat channels.',
        responsibilities: '• Handle inbound enterprise customer inquiries with patience and clarity.\n• Resolve technical and billing tickets within SLA.\n• Maintain high CSAT and First Contact Resolution (FCR) scores.\n• Escalate critical bugs to Tier-2 support teams.',
        requirements: '• Excellent neutral verbal and written English communication.\n• Willingness to work in rotational/US shifts.\n• Freshers with exceptional communication skills are welcome.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'job_106',
        title: 'Area Sales Executive - FMCG & Retail Distribution',
        category: 'Sales & Marketing',
        company: 'Leading FMCG Brand',
        location: 'Ahmedabad / Surat, Gujarat',
        state: 'Gujarat',
        city: 'Ahmedabad',
        jobType: 'Full-Time',
        workMode: 'On-Site',
        experience: '2 - 5 Years',
        experienceRange: '1-3',
        salary: '₹5,00,000 - ₹8,00,000 P.A. + TA/DA + Performance Bonus',
        openings: 6,
        urgent: true,
        featured: true,
        status: 'Active',
        skills: ['Distributor Management', 'Retail Channel Sales', 'Market Expansion', 'Stockist Negotiation'],
        description: 'Drive dealer-network expansion, retail shelf-space visibility, and sales volume across Gujarat territory.',
        responsibilities: '• Appoint and manage distributors and super-stockists across territories.\n• Achieve monthly secondary and primary sales targets.\n• Supervise beats and field sales representatives.\n• Monitor competitor activities and implement trade schemes.',
        requirements: '• 2+ years of field sales experience in FMCG, packaged foods, or consumer goods.\n• Strong local geographic knowledge and relationship with trade partners.\n• Valid 2-wheeler/4-wheeler driving license.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'job_107',
        title: 'DevOps & Cloud Infrastructure Engineer',
        category: 'IT & Software',
        company: 'FinTech High-Growth Enterprise',
        location: 'Chennai / Remote India',
        state: 'Tamil Nadu',
        city: 'Chennai',
        jobType: 'Full-Time',
        workMode: 'Remote',
        experience: '3 - 6 Years',
        experienceRange: '3-5',
        salary: '₹15,00,000 - ₹24,00,000 P.A.',
        openings: 2,
        urgent: false,
        featured: true,
        status: 'Active',
        skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD Pipelines', 'Linux', 'Prometheus'],
        description: 'Design and manage automated cloud infrastructure, continuous deployment pipelines, and high-availability systems for Pan-India fintech transactions.',
        responsibilities: '• Maintain production multi-region Kubernetes clusters on AWS.\n• Automate infrastructure provisioning with Terraform and Ansible.\n• Monitor latency, uptime, and system alerts 24x7 with Grafana/Prometheus.\n• Enhance cloud security and SOC-2 compliance.',
        requirements: '• Proven hands-on track record in AWS production infrastructure.\n• Proficient in Docker, Helm, and CI/CD tools (GitHub Actions / GitLab CI).\n• Strong script writing skills in Bash or Python.',
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
      },
      {
        id: 'job_108',
        title: 'Talent Acquisition Specialist / HR Recruiter',
        category: 'Human Resources & Staffing',
        company: 'CareerLine Solution Internal Hiring',
        location: 'Surat / Ahmedabad / Pan-India Remote',
        state: 'Gujarat',
        city: 'Surat',
        jobType: 'Full-Time',
        workMode: 'Hybrid',
        experience: '1 - 4 Years',
        experienceRange: '1-3',
        salary: '₹3,60,000 - ₹6,00,000 P.A. + Lucrative Closure Incentives',
        openings: 5,
        urgent: true,
        featured: true,
        status: 'Active',
        skills: ['End-to-end Recruitment', 'Naukri Portal', 'LinkedIn Sourcing', 'Headhunting', 'Screening'],
        description: 'Join CareerLine Solution family as a Recruitment Consultant! Sourcing top candidates for blue-chip companies, coordinating interviews, and driving high placement closures.',
        responsibilities: '• Source profiles via Naukri, LinkedIn, monster, references, and database.\n• Screen candidates for domain fit, salary expectations, and notice period.\n• Schedule technical and HR interview rounds with corporate clients.\n• Follow up on offer letters and candidate onboarding.',
        requirements: '• 1+ year recruitment experience in IT or Non-IT hiring consultancy.\n• Excellent negotiation and candidate handling skills.\n• Target-oriented mindset with zeal to earn high incentives.',
        createdAt: new Date().toISOString()
      }
    ],
    applications: [
      {
        id: 'app_1001',
        jobId: 'job_101',
        jobTitle: 'Senior Full Stack Developer (React & Node.js)',
        fullName: 'Vikramaditya Verma',
        email: 'vikram.v@example.com',
        phone: '+91 98201 12345',
        currentLocation: 'Bengaluru, Karnataka',
        experience: '5.2 Years',
        currentCTC: '₹12,00,000 P.A.',
        expectedCTC: '₹17,50,000 P.A.',
        noticePeriod: '30 Days',
        skills: 'React, Node, Express, MongoDB, AWS, Docker',
        coverNote: 'Excited about this opportunity. I have 5 years experience building scalable FinTech platforms.',
        resumeFileName: 'Vikram_Verma_Resume.pdf',
        resumeUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDM2Pj5zdHJlYW0KQlQgL0YxIDE2IFRmIDUwIDcwMCBUZCAoVmlrcmFtYWRpdHlhIFZlcm1hIC0gUmVzdW1lKVRqIEVTCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjE5IDAwMDAwIG4gCnRyYWlsZXI8PC9Sb290IDEgMCBSL1NpemUgNT4+CnN0YXJ0eHJlZgoyOTAKJSVFT0Y=',
        status: 'Shortlisted',
        recruiterNotes: 'Strong profile, cleared first technical round. Final client interview on Friday.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'app_1002',
        jobId: 'job_102',
        jobTitle: 'Branch Relationship Manager - Retail Banking',
        fullName: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@example.com',
        phone: '+91 99304 88776',
        currentLocation: 'Mumbai, Maharashtra',
        experience: '4 Years',
        currentCTC: '₹6,80,000 P.A.',
        expectedCTC: '₹9,50,000 P.A.',
        noticePeriod: 'Immediate Joiner',
        skills: 'HNI Banking, Mutual Funds, Life Insurance, Portfolio Growth',
        coverNote: 'Currently handling 250+ HNI accounts with 120% target achievement.',
        resumeFileName: 'Ananya_Deshmukh_CV.pdf',
        resumeUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCA2MTIgNzkyXS9QYXJlbnQgMiAwIFIvQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDMzPj5zdHJlYW0KQlQgL0YxIDE2IFRmIDUwIDcwMCBUZCAoQW5hbnlhIERlc2htdWtoIC0gQ1YpVGogRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2OCAwMDAwMCBuIAowMDAwMDAwMTI1IDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKdHJhaWxlcjw8L1Jvb3QgMSAwIFIvU2l6ZSA1PioKc3RhcnR4cmVmCjI4NwolaUVPZg==',
        status: 'Interview Scheduled',
        recruiterNotes: 'Documents verified. Client interview scheduled with Regional HR.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'app_1003',
        jobId: 'job_105',
        jobTitle: 'International BPO Customer Success Specialist (US Shift)',
        fullName: 'Rohan Mehra',
        email: 'rohan.mehra@example.com',
        phone: '+91 98112 55432',
        currentLocation: 'Delhi / Noida',
        experience: '2 Years',
        currentCTC: '₹3,80,000 P.A.',
        expectedCTC: '₹5,00,000 P.A.',
        noticePeriod: '15 Days',
        skills: 'Voice Support, Escalation Handling, CRM, English Fluency',
        coverNote: 'Worked 2 years in international tech support for US clients.',
        resumeFileName: 'Rohan_Mehra_Resume.pdf',
        resumeUrl: '',
        status: 'New',
        recruiterNotes: 'Fresh application, candidate screening call pending.',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      }
    ],
    employerRequests: [
      {
        id: 'req_2001',
        companyName: 'Apex Cloud Technologies Pvt Ltd',
        contactPerson: 'Karan Singhal',
        designation: 'VP Engineering & HR',
        email: 'karan.singhal@apexcloud.io',
        phone: '+91 98450 77123',
        city: 'Bengaluru / Pune',
        serviceType: 'Permanent Recruitment',
        positionsNeeded: '12 Positions',
        roles: 'Full Stack Developers, DevOps Engineers, Product Managers',
        urgency: 'Immediate (Within 15 days)',
        details: 'Looking for fast turnaround recruitment partner with pan-india candidates pool.',
        status: 'Contacted',
        notes: 'Initial requirement call completed, shared commercial terms agreement.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        id: 'req_2002',
        companyName: 'Gujarat Precision Bearings Ltd',
        contactPerson: 'Mahesh Patel',
        designation: 'Plant Head',
        email: 'mpatel@gpb-bearings.com',
        phone: '+91 94260 88912',
        city: 'Surat, Gujarat',
        serviceType: 'Contract Staffing',
        positionsNeeded: '25 Positions',
        roles: 'CNC Machine Operators, QA Inspectors, Assembly Supervisors',
        urgency: '1 Month',
        details: 'Need certified manufacturing workforce on 1-year renewable contract.',
        status: 'New',
        notes: 'Awaiting callback on Monday morning.',
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ],
    inquiries: [
      {
        id: 'inq_3001',
        name: 'Rajesh Solanki',
        email: 'rajesh.solanki@example.com',
        phone: '+91 97234 11223',
        subject: 'Job Opportunities in Gujarat for Mechanical Engineers',
        message: 'Hello CareerLine Solution, I have 4 years experience in industrial automation and looking for openings in Vadodara or Surat.',
        status: 'New',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
      }
    ],
    settings: {
      siteName: 'CareerLine Solution',
      tagline: 'Premier Pan-India HR & Recruitment Consultancy',
      phone: '+91 7573905399',
      altPhone: '+91 9274356988',
      whatsapp: '917573905399',
      email: 'info@careerlinesolution.com',
      address: '209 Marcelo, opp Shayam Mandir, VIP Road, Vesu, Surat, Gujarat - 395007',
      branchOffice: 'First Floor, Orbit Business Hub, Radhanpur Cross Road, Mehsana, Gujarat - 384002',
      panIndiaReach: 'Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Surat, Jaipur, Indore, Chandigarh',
      stats: {
        placements: '15,000+',
        clients: '500+',
        database: '1,50,000+',
        industries: '25+'
      }
    }
  };

  const dbDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  return initialData;
}

module.exports = {
  readData,
  writeData,
  initDefaultData
};
