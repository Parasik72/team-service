export const Roles = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
        try {
            const user = req.user;
            if(!user)
                return res.status(401).json({message: 'No authorization'});
            for (const userRole of user.roles)
                for (const requiredRole of roles)
                    if(userRole.value === requiredRole)
                        return next();
            return res.status(403).json({message: 'No access'});
        } catch (error) {
            return res.status(403).json({message: 'No access'});
        }
    }
}