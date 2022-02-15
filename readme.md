![cover](https://simplonline.co/_next/image?url=https%3A%2F%2Fsimplonline-v3-prod.s3.eu-west-3.amazonaws.com%2Fmedia%2Fimage%2Fjpg%2F4364834d-0907-44fe-9de9-2c85bf6112b4.jpg&w=1280&q=75)

# TANGER MED TECH - Dock management and appointment booking 🐬

Tanger Med is a global logistics hub, located on the Strait of Gibraltar and
connected to more than 180 global ports, offering processing capacities for 9
million containers, 7 million passengers, 700,000 trucks and 1 million vehicles.
Tanger Med is an industrial platform for more than 1,100 companies representing
an annual business volume of EUR 5,300 million in various sectors such as
automotive, aeronautics, logistics, textiles and trade.

## **Context of the project :**

Dockside operations have a central position in a supply chain. The challenges of
good dock management are therefore multiple because they involve all the
stakeholders: supplier, carrier and customer.

- Compliance with delivery times by respecting the loading and unloading times
  at the allocated docks and by reducing driver waiting times. It is important
  to prevent a truck from getting stuck at the dock or in the yard. It is
  customer satisfaction (Logistics, Transport and Supply Chain providers) that
  is at stake.
- Optimization of human and material resources at the dock to ensure the
  necessary operations for each truck arrival. Smoothing the activity of the
  docks and the workload is therefore interesting because it avoids having very
  busy periods when there is a risk of running out of resources and dead times
  when these resources are not used.

- The guarantee of a welcome driver in compliance with the safety protocols
  specific to each warehouse and current health measures. A guide to good
  practices to guarantee everyone's safety is also available to shippers to
  adapt their driver reception.
- Evaluation of the performance of warehouse teams and transport service
  providers. -The security of the goods and the warehouse by controlling the
  vehicles and the people who transport the goods. The good organization of the
  warehouse as a whole because visibility on the collection or delivery schedule
  allows the Preparation and Reception teams to better organize themselves in
  the areas before loading, for example.

### **Difficulties often encountered in warehouses :**

The first difficulty is that the suppliers' carriers are not always known. They
can change regularly and it is not necessarily the same driver. Security
constraints and reception protocols are not necessarily known by new people
arriving at the warehouse, especially if there is no appointment system.

Then, there are not always means of communication between the driver and the
warehouse to warn of a delay or a change. A delay can lead to many difficulties
for the rest of the day if it is not anticipated. Schedules are not always
dynamic, especially if they are written in an appointment book or printed. The
information of a delay given to an agent is not necessarily communicated to all
the teams due to the lack of collaborative tools.

Finally, the processes for making appointments, when they exist, are very often
time-consuming for the teams.

### How to optimize your dock management?

The first thing is to set up an appointment system for carriers or suppliers.
Although this process can be tedious without the right tools, it allows you to:

- Good dock management also involves managing dock occupancy and dock
  allocation.
- Set up a more precise provisional schedule for receiving and shipping and
  organize dockside resources accordingly. Having a provisional schedule is
  good, but a dynamic schedule is even better! Thus, in the event of a delay or
  cancellation of an appointment, the schedule is easily updated, ideally in
  real time. The teams can thus reorganize. ​

- establish a means of communication between the driver and the warehouse if
  necessary. guarantee the security of the goods and the warehouse by having the
  identity of the carrier and the information on the driver or the truck.
- communicate well to the carrier the security and reception protocols as well
  as the new health measures recently put in place to avoid wasting time once on
  site. Finally, it is important to organize the area well before loading so as
  not to waste time once the truck arrives. Visibility on the planning and the
  allocation of the quays upstream are essential to achieve this.

### **class diagram :**

![classDiagram drawio](https://user-images.githubusercontent.com/57900722/154047933-2a07b4e6-751f-4890-a0c8-cbb957a0e063.png)

> ### Definitions of Entities :

**User:** Includes all users who will use the reservations system or the stock
management systems

> Methods :

- GetAllUser(): gives all user information registered in the system.
- GetSingleUser(): gives all the information concerning a system user.
- UdateUser(): modifies the information of a certain user given to the system.

**Role:** Contains the definition of each role of a certain system user (Admin,
transport provider, port commander, etc.)

> Methods :

- getSingleRole(): gives information concerning certain roles in the system.
- GetAllRoles(): gives all the information of all the roles registered in the
  system.
- AddNewRole(): registers a new role in the system.

**Reservation:** Contains all reservations made by a supplier in the port's
reservation system.

> Methods :

- AddNewReservation(): registers a new reservation in the system with the
  supplier's information in consideration.
- CancelReservations(): Cancels a reservation already registered in the system
  this action and only available to System Administrators

**Quais:** contains the information of the quays available in the port and also
if a certain quay is used or free.

> Methods :

- CheckQuaisStatus(): gives the status of a certain dock if it is used or not
  used.
- AddNewQuais(): saves a new dock in the system.

**Container:** contains all the information concerning a container positioned in
a storage warehouse or in a ship parked in a port quay.

> Methods :

- GetSingleContainer(): gives the information of the container in consideration.
- GetAllContainers(): gives all the information of the containers in the system.
- AddNewCOntainer(): registers a container in the system.

**Port:** Contains port information like address, descriptions and others.

> Methods :

- GetPortData(): gives all port formations.
- UpdatePortData(): updates the information of the port already registered in
  the system.

**WareHouse:** contains the information of a certain warehouse or in stock the
containers in waiting to deliver them to the owner.

> Methods :

- getWareHouseData(): gives all the information of a certain warehouse located
  in the Harbor.
- UpdateWareHouseData(): modifies the information already recorded in the
  system.

**ShipOwner:** contains ship supplier information.

> Methods :

- getOwnerData(): gives the information of the owner of the ship.
- AddNewOwner(): registers a new owner to the system.

**System**: contains the information (metaData) gives your we board to affect
certain functionality in the system.

> Methods :

- getSystemData(); gives all port system information in order to use it to
  accomplish some necessary functionality in the system.
- UpdateSystemeData(): modifies some all port system information.
