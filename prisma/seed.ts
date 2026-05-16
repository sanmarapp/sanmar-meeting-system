import { PrismaClient, UserRole, ProjectStatus, RoomType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sanmar database seed...\n');

  // ========================================
  // 1. CREATE LOCATIONS
  // ========================================
  console.log('📍 Creating locations...');

  const towerOneCTG = await prisma.location.upsert({
    where: { name: 'Tower One Chittagong' },
    update: {},
    create: {
      name: 'Tower One Chittagong',
      type: 'OFFICE',
      city: 'Chittagong',
      address: 'Agrabad Commercial Area, Chittagong',
      isActive: true,
    },
  });
  const towerTwoDhaka = await prisma.location.upsert({
    where: { name: 'Tower Two Dhaka' },
    update: {},
    create: {
      name: 'Tower Two Dhaka',
      type: 'OFFICE',
      city: 'Dhaka',
      address: 'Gulshan, Dhaka',
      isActive: true,
    },
  });
  console.log(`✅ Created 2 locations\n`);

  // ========================================
  // 2. CREATE DEPARTMENTS
  // ========================================
  console.log('🏢 Creating departments...');

  const departments = [
    { name: 'IT', emailGroup: 'it@mysanmar.com' },
    { name: 'Corporate Admin', emailGroup: 'admin@mysanmar.com' },
    { name: 'Brand & Marketing', emailGroup: 'marketing@mysanmar.com' },
    { name: 'Sales', emailGroup: 'sales@mysanmar.com' },
    { name: 'Customer Service & Revenue', emailGroup: 'csr@mysanmar.com' },
    { name: 'Human Resources', emailGroup: 'hr@mysanmar.com' },
    { name: 'Legal & Estate', emailGroup: 'legal@mysanmar.com' },
    { name: 'Accounts', emailGroup: 'accounts@mysanmar.com' },
    { name: 'Business Development', emailGroup: 'bd@mysanmar.com' },
    { name: 'Planning Design & Development Management', emailGroup: 'pddm@mysanmar.com' },
    { name: 'Project Management & Engineering', emailGroup: 'pmed@mysanmar.com' },
    { name: 'Quality Control', emailGroup: 'qc@mysanmar.com' },
    { name: 'Supply Chain Management', emailGroup: 'scm@mysanmar.com' },
    { name: 'Budget, Planning & Control', emailGroup: 'bpc@mysanmar.com' },
    { name: 'Engineering Client Services', emailGroup: 'ecs@mysanmar.com' },
    { name: 'Internal Audit', emailGroup: 'audit@mysanmar.com' },
    { name: 'Information Technology', emailGroup: 'it@mysanmar.com' },
    { name: 'External Affairs', emailGroup: 'external@mysanmar.com' },
    { name: 'Market Intelligence & Survey', emailGroup: 'market@mysanmar.com' },
    { name: 'Billing & Contracting', emailGroup: 'billing@mysanmar.com' },
    { name: 'Inventory Management', emailGroup: 'inventory@mysanmar.com' },
    { name: 'Planning & Permission', emailGroup: 'planning@mysanmar.com' },
  ];

  const createdDepts = [];
  for (const dept of departments) {
    const created = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    createdDepts.push(created);
  }
  console.log(`✅ Created ${createdDepts.length} departments\n`);

  // ========================================
  // 3. CREATE USERS (Real Sanmar employees)
  // ========================================
  console.log('👥 Creating users...');
  const defaultPassword = await bcrypt.hash('Sanmar@2025', 10);
  const adminPassword = await bcrypt.hash('sanmar.123', 10);

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'projects.sanmar@gmail.com' },
    update: {},
    create: {
      email: 'projects.sanmar@gmail.com',
      name: 'Sanmar Admin',
      password: adminPassword,
      role: 'ADMIN',
      departmentId: createdDepts.find((d) => d.name === 'IT')!.id,
      designation: 'System Administrator',
      employeeId: 'ADMIN001',
      mustChangePassword: false,
      isActive: true,
    },
  });

  // Real employees from your data
  const employees = [
    { email: 'saleem.binsaleh@mysanmar.com', name: 'Saleem Bin Saleh', employeeId: '0002', designation: 'Sr. Executive Director', department: 'Legal & Estate', whatsapp: '8801713376364', role: 'ADMIN' },
    { email: 'shahriar.chowdhury@mysanmar.com', name: 'Shahriar Chowdhury', employeeId: '20001', designation: 'Sr. Executive Director', department: 'Corporate Admin', whatsapp: '8801713376307', role: 'ADMIN' },
    { email: 'rajib.mazumder@mysanmar.com', name: 'Rajib Mazumder', employeeId: '0023', designation: 'Deputy General Manager', department: 'Accounts', whatsapp: '8801713376331', role: 'DEPT_MANAGER' },
    { email: 'shafiqur.rahman@mysanmar.com', name: 'Shafiqur Rahman', employeeId: '0030', designation: 'Deputy General Manager', department: 'Legal & Estate', whatsapp: '8801713376400', role: 'DEPT_MANAGER' },
    { email: 'ujjal.dey@mysanmar.com', name: 'Ujjal Kumar Dey', employeeId: '0040', designation: 'Manager', department: 'Accounts', whatsapp: '8801713376357', role: 'EMPLOYEE' },
    { email: 'salim.meah@mysanmar.com', name: 'Salim Meah', employeeId: '0073', designation: 'Deputy General Manager', department: 'Sales', whatsapp: '8801713376303', role: 'DEPT_MANAGER' },
    { email: 'mohammed.aziz@mysanmar.com', name: 'Mohammed Aziz', employeeId: '0318', designation: 'Asst. General Manager', department: 'Quality Control', whatsapp: '8801713376423', role: 'EMPLOYEE' },
    { email: 'zahid.hasan@mysanmar.com', name: 'Md. Zahid Hasan', employeeId: '0413', designation: 'Sr. Manager', department: 'Planning Design & Development Management', whatsapp: '8801713376346', role: 'EMPLOYEE' },
    { email: 'iqbal.hossain@mysanmar.com', name: 'Md. Iqbal Hossain', employeeId: '0466', designation: 'Asst. General Manager', department: 'Budget, Planning & Control', whatsapp: '8801713376428', role: 'EMPLOYEE' },
    { email: 'imran@mysanmar.com', name: 'Md. Imran', employeeId: '0491', designation: 'Deputy General Manager', department: 'Sales', whatsapp: '8801713376312', role: 'DEPT_MANAGER' },
    { email: 'jahangir.alam@mysanmar.com', name: 'Jahangir Alam', employeeId: '0498', designation: 'Asst. General Manager', department: 'Engineering Client Services', whatsapp: '8801713376392', role: 'EMPLOYEE' },
    { email: 'joydip.dhar@mysanmar.com', name: 'Joydip Dhar', employeeId: '0518', designation: 'Manager', department: 'Internal Audit', whatsapp: '8801713376367', role: 'EMPLOYEE' },
    { email: 'mustafa.alam@mysanmar.com', name: 'Mustafa Alam', employeeId: '0649', designation: 'Sr. Manager', department: 'Information Technology', whatsapp: '8801769969687', role: 'EMPLOYEE' },
    { email: 'bikash.roy@mysanmar.com', name: 'Bikash Roy', employeeId: '0651', designation: 'Sr. Manager', department: 'Corporate Admin', whatsapp: '8801755644544', role: 'CORPORATE_ADMIN' },
    { email: 'rupan.barua@mysanmar.com', name: 'Rupan Kumar Barua', employeeId: '0697', designation: 'Sr. Assistant General Manager', department: 'Project Management & Engineering', whatsapp: '8801713376410', role: 'SITE_ADMIN' },
    { email: 'snahashis.dey@mysanmar.com', name: 'Snahashis Dey', employeeId: '0822', designation: 'Asst. General Manager', department: 'Planning Design & Development Management', whatsapp: '8801755644607', role: 'EMPLOYEE' },
    { email: 'shahinur.rahman@mysanmar.com', name: 'Md. Shahinur Rahman', employeeId: '0859', designation: 'Sr. Assistant General Manager', department: 'Project Management & Engineering', whatsapp: '8801713376433', role: 'SITE_ADMIN' },
    { email: 'ahsanuzzaman@mysanmar.com', name: 'Khondoker Ahsanuzzaman', employeeId: '0899', designation: 'Deputy General Manager', department: 'Budget, Planning & Control', whatsapp: '8801755644531', role: 'DEPT_MANAGER' },
    { email: 'azibor.rahman@mysanmar.com', name: 'Azibor Rahman', employeeId: '0976', designation: 'Sr. Assistant General Manager', department: 'Project Management & Engineering', whatsapp: '8801713376426', role: 'SITE_ADMIN' },
    { email: 'mainul.hoque@mysanmar.com', name: 'Mohammad Mainul Hoque', employeeId: '1027', designation: 'Asst. General Manager', department: 'External Affairs', whatsapp: '8801755644500', role: 'EMPLOYEE' },
    { email: 'shoeb.alrahe@mysanmar.com', name: 'Md. Shoeb Al Rahe', employeeId: '1036', designation: 'Deputy General Manager', department: 'Planning Design & Development Management', whatsapp: '8801755644548', role: 'SITE_ADMIN' },
    { email: 'tareq.hassan@mysanmar.com', name: 'Muhammad Tareq Hassan', employeeId: '1202', designation: 'Sr. Manager', department: 'Internal Audit', whatsapp: '8801755644567', role: 'EMPLOYEE' },
    { email: 'tohid.hossain@mysanmar.com', name: 'Syed Tohid Hossain', employeeId: '1248', designation: 'Sr. Manager', department: 'Accounts', whatsapp: '8801708150722', role: 'EMPLOYEE' },
    { email: 'tazul.islam@mysanmar.com', name: 'Md. Tazul Islam', employeeId: '1398', designation: 'Senior Manager', department: 'Sales', whatsapp: '8801755644676', role: 'EMPLOYEE' },
    { email: 'mehedi.hasan@mysanmar.com', name: 'S.M. Mehedi Hasan', employeeId: '1494', designation: 'Deputy General Manager', department: 'Brand & Marketing', whatsapp: '8801708150735', role: 'DEPT_MANAGER' },
    { email: 'zahir.chowdhury@mysanmar.com', name: 'Mohammad Zahir Uddin Chowdhury', employeeId: '1501', designation: 'Senior Manager', department: 'Sales', whatsapp: '8801713376336', role: 'EMPLOYEE' },
    { email: 'mahfujul.bari@mysanmar.com', name: 'Md. Mahfujul Bari', employeeId: '1803', designation: 'Assistant Director', department: 'Sales', whatsapp: '8801769969696', role: 'EMPLOYEE' },
    { email: 'arafien@mysanmar.com', name: 'Dewan Mohammed Shamshul Arafien', employeeId: '1839', designation: 'Sr. Manager', department: 'Planning Design & Development Management', whatsapp: '8801708150716', role: 'EMPLOYEE' },
    { email: 'jewel@mysanmar.com', name: 'Afangir Hossian Jewel', employeeId: '1993', designation: 'Assistant General Manager', department: 'Project Management & Engineering', whatsapp: '8801755644662', role: 'EMPLOYEE' },
    { email: 'mehadi.hasan@mysanmar.com', name: 'Md. Mehadi Hasan', employeeId: '2075', designation: 'Manager', department: 'Customer Service & Revenue', whatsapp: '8801713376352', role: 'EMPLOYEE' },
    { email: 'rossy@mysanmar.com', name: 'Andalib Rahman Rossy', employeeId: '2088', designation: 'Asst. General Manager', department: 'Brand & Marketing', whatsapp: '8801708135022', role: 'EMPLOYEE' },
    { email: 'mansur@mysanmar.com', name: 'Mohammed Abul Mansur', employeeId: '2176', designation: 'General Manager', department: 'Quality Control', whatsapp: '8801769969707', role: 'DEPT_MANAGER' },
    { email: 'nuruzzaman@mysanmar.com', name: 'Md. Nuruzzaman', employeeId: '2286', designation: 'Senior Deputy General Manager', department: 'Project Management & Engineering', whatsapp: '8801713376381', role: 'DEPT_MANAGER' },
    { email: 'nurul.khan@mysanmar.com', name: 'Mohammad Nurul Islam khan', employeeId: '2317', designation: 'Sr. Manager', department: 'Supply Chain Management', whatsapp: '8801730093503', role: 'EMPLOYEE' },
    { email: 'nazrul.khan@mysanmar.com', name: 'Md. Nazrul Islam Khan', employeeId: '2339', designation: 'Assistant Director', department: 'Human Resources', whatsapp: '8801713248767', role: 'DEPT_MANAGER' },
    { email: 'arup.nag@mysanmar.com', name: 'Arup Kanti Nag', employeeId: '2387', designation: 'Law Officer', department: 'Legal & Estate', whatsapp: '8801713376417', role: 'EMPLOYEE' },
    { email: 'ateshin.rukhsha@mysanmar.com', name: 'Ateshin Rukhsha', employeeId: '2435', designation: 'Sr. Manager', department: 'Planning Design & Development Management', whatsapp: '8801708135015', role: 'EMPLOYEE' },
    { email: 'mahmudur.rahman@mysanmar.com', name: 'Mahmudur Rahman', employeeId: '2456', designation: 'Director', department: 'Quality Control', whatsapp: '8801713376408', role: 'DEPT_MANAGER' },
    { email: 'rabiul.islam@mysanmar.com', name: 'M. M. Rabiul Islam', employeeId: '2509', designation: 'Asst. General Manager', department: 'Inventory Management', whatsapp: '8801708135029', role: 'EMPLOYEE' },
    { email: 'raju.ahmmed@mysanmar.com', name: 'Md. Raju Ahmmed', employeeId: '2540', designation: 'Manager', department: 'Supply Chain Management', whatsapp: '8801708150746', role: 'EMPLOYEE' },
    { email: 'farhad.chowdhury@mysanmar.com', name: 'Md. Farhad Chowdhury', employeeId: '2544', designation: 'Manager & Team Leader', department: 'Sales', whatsapp: '8801755644604', role: 'EMPLOYEE' },
    { email: 'anoar.bhuiyan@mysanmar.com', name: 'Md Anoar Hossain Bhuiyan', employeeId: '2557', designation: 'General Manager', department: 'Supply Chain Management', whatsapp: '8801713248779', role: 'DEPT_MANAGER' },
    { email: 'sohel.rana@mysanmar.com', name: 'Md. Sohel Rana', employeeId: '2560', designation: 'Manager', department: 'Supply Chain Management', whatsapp: '8801708150742', role: 'EMPLOYEE' },
    { email: 'motalab@mysanmar.com', name: 'Mohammad Abdul Motalab', employeeId: '2565', designation: 'Manager', department: 'Sales', whatsapp: '8801713376340', role: 'EMPLOYEE' },
    { email: 'leyakat.hossain@mysanmar.com', name: 'Md Leyakat Hossain', employeeId: '2602', designation: 'General Manager', department: 'Sales', whatsapp: '8801755644613', role: 'DEPT_MANAGER' },
    { email: 'shamsuddin.bhuiyan@mysanmar.com', name: 'Mohammed Shamsuddin Bhuiyan', employeeId: '2634', designation: 'Senior Manager', department: 'Sales', whatsapp: '8801755644629', role: 'EMPLOYEE' },
    { email: 'shaifuddin@mysanmar.com', name: 'Mohammad Shaifuddin', employeeId: '2655', designation: 'Deputy General Manager', department: 'Sales', whatsapp: '8801708150705', role: 'DEPT_MANAGER' },
    { email: 'mohiuddin.ahmed@mysanmar.com', name: 'Md. Mohiuddin Ahmed', employeeId: '2666', designation: 'Senior Manager', department: 'Supply Chain Management', whatsapp: '8801713248770', role: 'EMPLOYEE' },
    { email: 'ashraful.haque@mysanmar.com', name: 'Syed Ashraful Haque', employeeId: '2668', designation: 'Sr. Manager', department: 'Market Intelligence & Survey', whatsapp: '8801769969710', role: 'EMPLOYEE' },
    { email: 'zakir.hossain@mysanmar.com', name: 'MD Zakir Hossain', employeeId: '2680', designation: 'Asst. General Manager', department: 'Billing & Contracting', whatsapp: '8801713376394', role: 'EMPLOYEE' },
    { email: 'monir.hasan@mysanmar.com', name: 'MD. Monir Hasan', employeeId: '2682', designation: 'Deputy General Manager', department: 'Planning Design & Development Management', whatsapp: '8801708135030', role: 'DEPT_MANAGER' },
    { email: 'ashiqur.rahman@mysanmar.com', name: 'Sayed Ashiqur Rahman', employeeId: '2703', designation: 'Manager', department: 'Sales', whatsapp: '8801755644535', role: 'EMPLOYEE' },
    { email: 'naziul.islam@mysanmar.com', name: 'Md. Naziul Islam', employeeId: '2731', designation: 'Sr. General Manager', department: 'Business Development', whatsapp: '8801769969689', role: 'DEPT_MANAGER' },
    { email: 'ejaj@mysanmar.com', name: 'Mohammed Ejaj', employeeId: '2761', designation: 'Manager', department: 'Sales', whatsapp: '8801708150708', role: 'EMPLOYEE' },
    { email: 'serajee@mysanmar.com', name: 'A.S.M Efta Khairul Ahad Serajee', employeeId: '2775', designation: 'Manager', department: 'Sales', whatsapp: '8801755644627', role: 'EMPLOYEE' },
    { email: 'retesh.chowdhury@mysanmar.com', name: 'Retesh Mahmud Chowdhury', employeeId: '2776', designation: 'Manager', department: 'Sales', whatsapp: '8801713376345', role: 'EMPLOYEE' },
    { email: 'shajedul.islam@mysanmar.com', name: 'Shajedul Islam', employeeId: '2786', designation: 'Senior Manager', department: 'Business Development', whatsapp: '8801755644606', role: 'EMPLOYEE' },
    { email: 'nijam.uddin@mysanmar.com', name: 'Mohammed Nijam Uddin', employeeId: '2799', designation: 'Senior Manager', department: 'Sales', whatsapp: '8801713376306', role: 'EMPLOYEE' },
    { email: 'shafkat.islam@mysanmar.com', name: 'Shafkat Islam', employeeId: '2833', designation: 'Sr. Manager', department: 'Planning Design & Development Management', whatsapp: '8801755644587', role: 'EMPLOYEE' },
    { email: 'subrata.sen@mysanmar.com', name: 'Subrata Sen', employeeId: '2885', designation: 'Deputy General Manager', department: 'Project Management & Engineering', whatsapp: '8801713376308', role: 'DEPT_MANAGER' },
    { email: 'razaul.karim@mysanmar.com', name: 'Syed Razaul Karim', employeeId: '2902', designation: 'Asst. General Manager', department: 'Customer Service & Revenue', whatsapp: '8801755644625', role: 'EMPLOYEE' },
    { email: 'khaled.shouqi@mysanmar.com', name: 'Khaled Soud Shouqi', employeeId: '2917', designation: 'Manager', department: 'Accounts', whatsapp: '8801755644678', role: 'EMPLOYEE' },
    { email: 'abdullah.zaid@mysanmar.com', name: 'Abdullah Ibn Zaid', employeeId: '2970', designation: 'Director', department: 'Corporate Admin', whatsapp: '8801332811858', role: 'ADMIN' },
    { email: 'malehul.chowdhury@mysanmar.com', name: 'Malehul Akber Chowdhury', employeeId: '2972', designation: 'Asst. General Manager', department: 'Customer Service & Revenue', whatsapp: '8801713376301', role: 'EMPLOYEE' },
    { email: 'mosaddek.samad@mysanmar.com', name: 'Syed Mosaddek Bin Samad', employeeId: '2984', designation: 'Sr. Assistant General Manager', department: 'Customer Service & Revenue', whatsapp: '8801332811859', role: 'EMPLOYEE' },
    { email: 'altaf.hossain@mysanmar.com', name: 'MD. Altaf Hossain', employeeId: '3070', designation: 'General Manager', department: 'Project Management & Engineering', whatsapp: '8801713376382', role: 'DEPT_MANAGER' },
    { email: 'salauddin.mahmood@mysanmar.com', name: 'Gazi Salauddin Mahmood', employeeId: '3084', designation: 'Deputy General Manager', department: 'Customer Service & Revenue', whatsapp: '8801755644566', role: 'DEPT_MANAGER' },
    { email: 'obaidul.haque@mysanmar.com', name: 'Obaidul Haque', employeeId: '3100', designation: 'Sr. Manager', department: 'Sales', whatsapp: '8801755644564', role: 'EMPLOYEE' },
    { email: 'mozamml.hoque@mysanmar.com', name: 'Md. Mozamml Hoque', employeeId: '3115', designation: 'Sr. General Manager', department: 'Business Development', whatsapp: '8801332523575', role: 'DEPT_MANAGER' },
    { email: 'debashish.muhuri@mysanmar.com', name: 'Debashish Muhuri', employeeId: '3117', designation: 'Manager', department: 'Human Resources', whatsapp: '8801769969690', role: 'EMPLOYEE' },
    { email: 'rezaul.karim@mysanmar.com', name: 'Md. Rezaul Karim', employeeId: '3118', designation: 'Deputy General Manager', department: 'Sales', whatsapp: '8801730072263', role: 'DEPT_MANAGER' },
    { email: 'golam.kibria@mysanmar.com', name: 'Md. Golam Kibria', employeeId: '0828', designation: 'Sr. Assistant General Manager', department: 'Planning & Permission', whatsapp: '8801730376540', role: 'EMPLOYEE' },
    { email: 'biswajit.chowdhury@mysanmar.com', name: 'Biswajit Chowdhury', employeeId: '3127', designation: 'Sr. General Manager', department: 'Project Management & Engineering', whatsapp: '8801713376344', role: 'DEPT_MANAGER' },
  ];

  let userCount = 1;
  for (const emp of employees) {
    const dept = createdDepts.find((d) => d.name === emp.department);
    if (dept) {
      await prisma.user.upsert({
        where: { email: emp.email },
        update: {},
        create: {
          email: emp.email,
          name: emp.name,
          password: defaultPassword,
          employeeId: emp.employeeId,
          designation: emp.designation,
          whatsappNumber: emp.whatsapp,
          role: emp.role as UserRole,
          departmentId: dept.id,
          mustChangePassword: true,
          isActive: true,
        },
      });
      userCount++;
    }
  }
  console.log(`✅ Created ${employees.length + 1} users\n`);

  // ========================================
  // 4. CREATE MEETING ROOMS
  // ========================================
  console.log('🏛️ Creating meeting rooms...');
  const rooms = [
    { roomName: 'Board Room', floor: 'Floor 15', description: 'Higher Management — restricted', capacity: 33, roomType: 'board', isBoardRoom: true, locationId: towerOneCTG.id },
    { roomName: 'Presentation Room', floor: 'Floor 15', description: 'Presentations and demos', capacity: 7, roomType: 'conference', isBoardRoom: true, locationId: towerOneCTG.id },
    { roomName: 'Rome', floor: 'Floor 15', description: '', capacity: 4, roomType: 'conference', isBoardRoom: true, locationId: towerOneCTG.id },
    { roomName: 'PRAGUE', floor: 'Floor 15', description: 'Customer Service Center', capacity: 5, roomType: 'conference', isBoardRoom: true, locationId: towerOneCTG.id },
    { roomName: 'LONDON', floor: 'Floor 15', description: 'For New Clients only - Sales & CSD', capacity: 9, roomType: 'external', isBoardRoom: false, locationId: towerOneCTG.id },
    { roomName: 'GENEVA', floor: 'Floor 15', description: 'Adjacent to the Front Desk', capacity: 4, roomType: 'conference', isBoardRoom: false, locationId: towerOneCTG.id },
    { roomName: 'PARIS', floor: 'Floor 15', description: 'Existing Clients and Internal meeting', capacity: 6, roomType: 'internal', isBoardRoom: false, locationId: towerOneCTG.id },
    { roomName: 'MONACO', floor: 'Floor 16', description: '', capacity: 6, roomType: 'conference', isBoardRoom: false, locationId: towerOneCTG.id },
    { roomName: 'BUDAPEST', floor: 'Floor 16', description: '', capacity: 6, roomType: 'conference', isBoardRoom: false, locationId: towerOneCTG.id },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { roomName: room.roomName },
      update: {},
      create: room as any,
    });
  }
  console.log(`✅ Created ${rooms.length} meeting rooms\n`);

  // ========================================
  // 5. CREATE PROJECT SITES
  // ========================================
  console.log('🏗️ Creating project sites...');
  const projects = [
    { name: 'Sanmar Green Park', location: 'Chittagong', address: 'Arefin Nagor, Bayezid link road, Chattogram', status: 'ONGOING' },
    { name: 'Sanmar Bel Mont', location: 'Chittagong', address: 'Mehedibagh, Chattogram', status: 'ONGOING' },
    { name: 'I R Centre', location: 'Chittagong', address: 'Ishak building, Dewan Nagar, Fotika, Hathazari, Chattogram', status: 'ONGOING' },
    { name: 'Sanmar Rawshan', location: 'Chittagong', address: 'OR Nizam Road, Road # 1, Plot # 12', status: 'ONGOING' },
    { name: 'Sanmar Rasa Vista', location: 'Chittagong', address: 'Plot No. : 20/B, Nagorik Co-Operative H/S, Bayzid Bostami Road, Chattogram', status: 'ONGOING' },
    { name: 'Dakshinayan', location: 'Chittagong', address: '52, Momin Road, DC hill, Chattogram', status: 'ONGOING' },
    { name: 'Villa Del Omar', location: 'Chittagong', address: 'Nazir Ahmed Chowdhury Road, Anderkillah, Chattogram', status: 'ONGOING' },
    { name: 'Sanmar Valor', location: 'Chittagong', address: '305, Sholokbahar, Katalgonj, Panchlaish, Chattogram', status: 'ONGOING' },
    { name: 'Ocho Harmanas', location: 'Chittagong', address: 'Plot No. #1/A, Katalgonj, Chattogram', status: 'ONGOING' },
    { name: 'Orchard Garden', location: 'Chittagong', address: 'Yakub Future Park, Chattogram', status: 'ONGOING' },
    { name: 'Sanmar Shabnam Aziz', location: 'Chittagong', address: 'Aziz Bhaban, Plot-22/A, High Level Road, Lalkhan Bazar, Chattogram', status: 'ONGOING' },
    { name: 'The Crest', location: 'Chittagong', address: 'Plot #5C/2, Road#05, Nasirabad H/S, Chattrogram', status: 'ONGOING' },
    { name: 'Grand Diamond', location: 'Chittagong', address: 'Plot #12, Road#04, Nasirabad H/S, Chattrogram', status: 'ONGOING' },
    { name: 'Sanmar Heritage', location: 'Chittagong', address: 'Plot #41/B-2, Road#05, Nasirabad H/S, Chattrogram', status: 'ONGOING' },
    { name: 'Sanmar Monihar', location: 'Chittagong', address: 'Plot No. : 8/C, Road : 05, Nasirabad H/S, Chattogram', status: 'ONGOING' },
    { name: 'Bithika Plaza', location: 'Chittagong', address: 'Vatiary, Chattogram', status: 'ONGOING' },
    { name: 'Palladium', location: 'Chittagong', address: 'Raozan, Chattogram', status: 'ONGOING' },
    { name: 'Meher Manaar', location: 'Chittagong', address: '6 Abedin Colony, Love Lane Road, Chattogram', status: 'ONGOING' },
    { name: 'Subarna Rekha', location: 'Chittagong', address: '50/A, Panichlaish R/A, Chattogram', status: 'ONGOING' },
    { name: 'Arani', location: 'Chittagong', address: 'Plot No : 05, Road : 02, Mozafar Nagar, Chattogram', status: 'ONGOING' },
    { name: 'Sana Acropolish', location: 'Chittagong', address: 'Plot#11/4, Road No#5, North Khushi R/A, ctg', status: 'ONGOING' },
    { name: 'No. 14 by SANMAR', location: 'Chittagong', address: 'Plot No. #71/C, House #14, Road#1, Khulshi R/A, Ctg', status: 'ONGOING' },
    { name: 'J N Avellino', location: 'Chittagong', address: 'Plot # 10, Road # 6, Nasirabad H/S, Chattogram', status: 'ONGOING' },
    { name: 'Lavender lawn', location: 'Chittagong', address: 'Habib Lane, Khulshi R/A, Chattrogram', status: 'ONGOING' },
    { name: 'Sanmar Kensington', location: 'Chittagong', address: 'Duncan Hill, Next to N/S, Chattogram', status: 'ONGOING' },
    { name: 'Rahim Tower', location: 'Chittagong', address: '12, S. S. Khaled Road, Chattogram', status: 'ONGOING' },
    { name: 'Ayub Centre', location: 'Chittagong', address: 'Kapashgola, Chattogram', status: 'ONGOING' },
    { name: 'Sanmar Sylvia', location: 'Dhaka', address: 'Plot No. B21 & B23, Block # B, Road # 2, Aftab Nagor', status: 'ONGOING' },
    { name: 'Sanmar Nusifa', location: 'Dhaka', address: 'Plot: KA-33, South Badda, Dhaka', status: 'ONGOING' },
    { name: 'One Gulshan', location: 'Dhaka', address: 'Gulshan North Avenue, Dhaka', status: 'ONGOING' },
    { name: 'Aras Palace', location: 'Dhaka', address: 'Road#10, Block:C, Bashundhara, Dhaka', status: 'ONGOING' },
    { name: 'Sunrise', location: 'Dhaka', address: 'Plot : 225, 227 & 229, Road # Ranavola Avenue, Sector : 10, Uttara, Dhaka', status: 'ONGOING' },
  ];

  const siteAdminUser = await prisma.user.findUnique({
    where: { email: 'shoeb.alrahe@mysanmar.com' },
  });

  if (siteAdminUser) {
    for (const project of projects) {
      await prisma.projectSite.upsert({
        where: { name: project.name },
        update: {},
        create: {
          name: project.name,
          location: project.location,
          address: project.address,
          status: project.status as ProjectStatus,
          siteAdminId: siteAdminUser.id,
          allowVisits: true,
          isVisitReady: true,
          hasMarketingSuite: true,
          marketingSuiteCapacity: 15,
        },
      });
    }
  }
  console.log(`✅ Created ${projects.length} project sites\n`);

  // ========================================
  // 6. CREATE NOTIFICATION TEMPLATES
  // ========================================
  console.log('📧 Creating notification templates...');
  const templates = [
    {
      channel: 'WHATSAPP',
      trigger: 'BOOKING_CONFIRMED',
      subject: null,
      body: 'Hi {{userName}}, your meeting room "{{roomName}}" is confirmed for {{startTime}}. Location: {{location}}',
      language: 'en',
    },
    {
      channel: 'EMAIL',
      trigger: 'BOOKING_CONFIRMED_EMAIL',
      subject: 'Meeting Room Confirmed - {{roomName}}',
      body: 'Dear {{userName}},\n\nYour booking for {{roomName}} has been confirmed.\n\nDate & Time: {{startTime}}\nDuration: {{duration}} minutes\nLocation: {{location}}\n\nThank you,\nSanmar Meeting Desk',
      language: 'en',
    },
    {
      channel: 'WHATSAPP',
      trigger: 'SITE_VISIT_SCHEDULED',
      subject: null,
      body: 'Dear {{clientName}}, your site visit to {{projectName}} is scheduled for {{visitDate}} at {{visitTime}}. Our sales rep {{salesRepName}} will guide you. Location: {{address}}',
      language: 'en',
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { trigger: template.trigger },
      update: {},
      create: template,
    });
  }
  console.log(`✅ Created ${templates.length} notification templates\n`);

  console.log('🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Locations: 2`);
  console.log(`   - Departments: ${createdDepts.length}`);
  console.log(`   - Users: ${employees.length + 1} (including admin)`);
  console.log(`   - Rooms: ${rooms.length}`);
  console.log(`   - Projects: ${projects.length}`);
  console.log(`   - Templates: ${templates.length}`);
  console.log('\n✅ Database ready for development!\n');
  console.log('🔐 Admin login: projects.sanmar@gmail.com / sanmar.123');
  console.log('🔐 Employee login: any email above / Sanmar@2025\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
