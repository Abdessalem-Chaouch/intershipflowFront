import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from './user.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const userService = inject(UserService);
    const router = inject(Router);
    const currentUser = userService.currentUser();

    if (!currentUser) {
        // Redirect to landing if not authenticated
        router.navigate(['/landing']);
        return false;
    }

    const expectedRoles = route.data['roles'] as Array<string>;
    
    if (!expectedRoles || expectedRoles.length === 0) {
        return true;
    }

    if (expectedRoles.includes(currentUser.role!)) {
        return true;
    }

    // Role not authorized
    if (currentUser.role === 'User') {
        router.navigate(['/landing']);
    } else {
        router.navigate(['/notfound']);
    }
    return false;
};
