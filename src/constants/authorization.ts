export enum Action {
    ADD = 'ADD',
    UPDATE = 'UPDATE',
    READ = 'READ',
    DELETE = 'DELETE',
    APPROVAL = 'APPROVAL'
}

export enum Resource {
    ADMIN_OPTIONS = 'ADMIN_OPTIONS',
    CONTACT_PERSONS = 'CONTACT_PERSONS',
    ORGANIZATIONS = 'ORGANIZATIONS',
    USERS = 'USERS',
    PROJECTS = 'PROJECTS',
    OPPORTUNITIES = 'OPPORTUNITIES',
    TIMESHEETS = "TIMESHEETS",
    PROFILE = 'PROFILE'
}

export enum Grant {
    ANY = 'ANY',
    OWN = 'OWN',
    MANAGE = 'MANAGE'
}