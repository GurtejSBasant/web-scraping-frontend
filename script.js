document.getElementById('searchButton').addEventListener('click', search);
document.getElementById('viewEmployeesButton').addEventListener('click', fetchEmployees);
document.getElementById('fetchEmployeesButton').addEventListener('click', fetchEmployeesOfCompany); // Added event listener

async function fetchEmployeesOfCompany() {
    const companyDomain = document.getElementById('companyDomainInput').value;
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = 'Fetching employees of the company...';

    if (!companyDomain) {
        alert("Please enter the company domain.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/fetch-employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: 'ppKeBXq42XUYmR7o6NyW6Q',
                q_organization_domains: companyDomain,
                // person_seniorities: ["manager"], // You can adjust this if needed
                organization_num_employees_ranges: ["1,10000"] // You can adjust this if needed
            })
        });

        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }

        const employeeData = await response.json();
        console.log(employeeData); // Debugging: log the response
        displayEmployees(employeeData);
    } catch (error) {
        dataDisplay.innerHTML = `Error: ${error.message}`;
    }
}

async function search() {
    const searchTerm = document.getElementById('searchInput').value;
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = 'Searching...';

    try {
        const response = await fetch(`http://localhost:3000/search?term=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }
        const searchData = await response.json();
        displayData(searchData);
    } catch (error) {
        dataDisplay.innerHTML = `Error: ${error.message}`;
    }
}

async function getCompanyDetails(companyName, logoUrl) {
    try {
        console.log(`Fetching details for company: ${companyName}, logo URL: ${logoUrl}`); // Log request details
        const response = await fetch('http://localhost:3000/get-company-domain-updated', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                companyName: companyName,
                apiKey: 'ppKeBXq42XUYmR7o6NyW6Q', // Replace with your API key
                logoUrl: logoUrl
            })
        });

        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }

        const companyData = await response.json();
        console.log("Received company data:", companyData); // Log response data

        // Extract the website URL from the response
        const websiteUrl = companyData.data.website_url;
        if (websiteUrl) {
            // Show a confirmation dialog with the website URL
            const isUrlCorrect = confirm(`Please check if this URL is correct: ${websiteUrl}`);
            if (isUrlCorrect) {
                // Update the DOM to display the confirmed URL
                const dataDisplay = document.getElementById('dataDisplay');
                const urlDiv = document.createElement('div');
                urlDiv.classList.add('data-item');
                urlDiv.innerHTML = `<p>Company Website: <a href="${websiteUrl}" target="_blank">${websiteUrl}</a></p>`;
                dataDisplay.appendChild(urlDiv);
            } else {
                alert(`URL not confirmed.`);
            }
        } else {
            alert('No website URL found in the response.');
        }

        return companyData;
    } catch (error) {
        console.error('Error fetching company details:', error);
        throw new Error('Failed to fetch company details');
    }
}



async function fetchEmployees() {
    const companyDomain = document.getElementById('companyDomainInput').value;
    // const positionTitle = document.getElementById('positionTitleInput').value;
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = 'Fetching employees...';

    if (!companyDomain) {
        alert("Please enter both company domain and position title.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/fetch-employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: 'ppKeBXq42XUYmR7o6NyW6Q',
                q_organization_domains: companyDomain,
                // position_title: positionTitle,
                person_seniorities: ["manager"],
                organization_num_employees_ranges: ["1,10000"]
            })
        });

        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }

        const employeeData = await response.json();
        console.log(employeeData); // Debugging: log the response
        displayEmployees(employeeData);
    } catch (error) {
        dataDisplay.innerHTML = `Error: ${error.message}`;
    }
}

async function fetchEmployeeEmail(employeeName) {
    try {
        const domain = document.getElementById('companyDomainInput').value; // Extracting domain from input field
        const organizationName = domain.split('.')[0]; // Extracting organization name from domain
        console.log("domain:",domain)
        console.log("organizationName:",organizationName)

        const response = await fetch('http://localhost:3000/fetch-employees-emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: 'ppKeBXq42XUYmR7o6NyW6Q',
                first_name: employeeName.split(' ')[0], // Extracting first name
                last_name: employeeName.split(' ')[1], // Extracting last name
                organization_name: organizationName, // Using extracted organization name
                domain: domain,
                reveal_personal_emails: true
            })
        });

        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }
      
        const responseData = await response.json();
        console.log("response:",responseData)

        const email = responseData.person.email;
        const contact = responseData.person.organization.sanitized_phone;

        // Constructing the contact information
        let contactInfo = 'Contact: ';
        if (contact) {
            contactInfo += contact;
        } else {
            contactInfo += 'N/A';
        }

        // Return the email and contact information
        return {
            email: email,
            contact: contactInfo
        };
    } catch (error) {
        console.error('Error fetching employee email:', error);
        throw new Error('Failed to fetch employee email');
    }
}

// Update displayEmployees function to show email and contact
function displayEmployees(data) {
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = '';

    const employees = data.people || [];
    const contacts = data.contacts || [];

    const allEmployees = [...employees, ...contacts];

    if (allEmployees.length === 0) {
        dataDisplay.innerHTML = 'No employees found';
        return;
    }

    allEmployees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.classList.add('data-item');

        const email = employee.email || 'Email not disclosed';
        const contact = employee.contact || 'N/A';

        const employeeContent = `
            <div>
                <h2>${employee.name}</h2>
                <p>Position: ${employee.title || 'N/A'}</p>
                <p>Email: ${email}</p>
                <p>${contact}</p>
                <a href="${employee.linkedin_url}" target="_blank">LinkedIn Profile</a>
                <button class="reveal-email" data-employee="${employee.name}">Reveal Email</button>
            </div>
        `;

        employeeDiv.innerHTML = employeeContent;
        dataDisplay.appendChild(employeeDiv);
    });

    // Attach click event listener to reveal email buttons
    const revealButtons = document.querySelectorAll('.reveal-email ');
    revealButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const employeeName = button.dataset.employee;
            try {
                const email = await fetchEmployeeEmail(employeeName);
                const emailElement = button.parentElement.querySelector('p:nth-of-type(2)'); // Select the email paragraph
                emailElement.textContent = `Email: ${email.email}`; // Update the email
                const contactElement = button.parentElement.querySelector('p:nth-of-type(3)'); // Select the contact paragraph
                contactElement.textContent = email.contact; // Update the contact
            } catch (error) {
                console.error('Error:', error.message);
                alert('Failed to fetch employee email');
            }
        });
    });
}

// Update displayEmployees function to show email and contact
function displayEmployees(data) {
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = '';

    const employees = data.people || [];
    const contacts = data.contacts || [];

    const allEmployees = [...employees, ...contacts];

    if (allEmployees.length === 0) {
        dataDisplay.innerHTML = 'No employees found';
        return;
    }

    allEmployees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.classList.add('data-item');

        const email = employee.email || 'Email not disclosed';
        const contact = employee.contact || 'N/A';

        const employeeContent = `
            <div>
                <h2>${employee.name}</h2>
                <p>Position: ${employee.title || 'N/A'}</p>
                <p>Email: ${email}</p>
                <p>${contact}</p>
                <a href="${employee.linkedin_url}" target="_blank">LinkedIn Profile</a>
                <button class="reveal-email" data-employee="${employee.name}">Reveal Email</button>
            </div>
        `;

        employeeDiv.innerHTML = employeeContent;
        dataDisplay.appendChild(employeeDiv);
    });

    // Attach click event listener to reveal email buttons
    const revealButtons = document.querySelectorAll('.reveal-email');
    revealButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const employeeName = button.dataset.employee;
            try {
                const email = await fetchEmployeeEmail(employeeName);
                const emailElement = button.parentElement.querySelector('p:nth-of-type(2)'); // Select the email paragraph
                emailElement.textContent = `Email: ${email.email}`; // Update the email
                const contactElement = button.parentElement.querySelector('p:nth-of-type(3)'); // Select the contact paragraph
                contactElement.textContent = email.contact; // Update the contact
            } catch (error) {
                console.error('Error:', error.message);
                alert('Failed to fetch employee email');
            }
        });
    });
}





function displayData(response) {
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = '';

    if (!response.jobs || response.jobs.length === 0) {
        dataDisplay.innerHTML = 'No jobs found';
        return;
    }

    response.jobs.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('data-item');

        // Check if the logoUrl is a valid URL
        let logoContent;
        try {
            new URL(item.logoUrl);
            logoContent = `<img src="${item.logoUrl}" alt="${item.company} Logo" class="logo">`;
        } catch (_) {
            logoContent = `<div class="text-logo">${item.logoUrl}</div>`;
        }

        const itemContent = `
            ${logoContent}
            <div>
                <h2>${item.title}</h2>
                <p>Company: <span class="company-name" data-company="${item.company}" data-logo="${item.logoUrl}">${item.company}</span></p>
                <p>Location: ${item.location}</p>
                <p>Tags: ${item.tags}</p>
                <a href="${item.link}" target="_blank">Link</a>
            </div>
        `;

        itemDiv.innerHTML = itemContent;
        dataDisplay.appendChild(itemDiv);
    });

    // Attach click event listener to company names
    const companyNames = document.querySelectorAll('.company-name');
    companyNames.forEach(company => {
        company.addEventListener('click', async () => {
            const companyName = company.dataset.company;
            const logoUrl = company.dataset.logo;
            try {
                const companyDetails = await getCompanyDetails(companyName, logoUrl);
                alert(`Company Name: ${companyDetails.data.organization_name}\nBest match: ${companyDetails.message}`);
            } catch (error) {
                console.error('Error:', error.message);
                alert('Failed to fetch company details');
            }
        });
    });
}
