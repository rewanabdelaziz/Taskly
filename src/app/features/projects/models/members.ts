export interface Member{
    member_id: string,
    project_id: string,
    user_id: string,
    role: string,
    email: string,
    metadata: {
        name: string,
        email: string,
        department: string
    }
    
}