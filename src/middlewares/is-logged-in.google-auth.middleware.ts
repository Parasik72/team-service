export const isLogedInGoogle = (req: any, res: any, next: any) => {
    try {
        if(req.method === 'OPTIONS')
            return next();
        if(req.user)
            return next();
        return res.status(401).json({message: 'Not authorized'});
    } catch (error) {
        return res.status(401).json({message: 'Not authorized'});
    }
}