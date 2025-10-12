<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Ensure the user is authenticated
        if (!Auth::check()) {
            // Redirect unauthenticated users to the login page
            return redirect()->route('login');
        }

        $user = Auth::user();

        // 2. Check the user's role. If the role is 'admin', allow the request.
        // NOTE: You may need to adjust '$user->role' based on your actual database schema.
        if ($user->role === 'admin') {
            return $next($request);
        }

        // 3. If the role check fails, abort with a 403 Forbidden response.
        // Inertia will automatically display the corresponding 403 error page (if defined), 
        // which is the proper behavior for authorization failure.
        abort(403, 'Unauthorized action. You must be an administrator.');

        // Alternative: Redirect to a safe page (e.g., dashboard)
        // return redirect()->route('dashboard');
    }
}
