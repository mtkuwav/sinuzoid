<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\ExpiredTokenException;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\InvalidTokenException;

class ExceptionListener
{
    private bool $debug;

    public function __construct(bool $debug = false)
    {
        $this->debug = $debug;
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $request = $event->getRequest();

        // Only handle API requests (requests starting with /api)
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        $response = $this->createApiErrorResponse($exception);
        
        if ($response) {
            $event->setResponse($response);
        }
    }

    private function createApiErrorResponse(\Throwable $exception): ?JsonResponse
    {
        $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR;
        $message = 'An error occurred';
        $code = 'INTERNAL_ERROR';

        // Handle specific exception types
        switch (true) {
            case $exception instanceof ExpiredTokenException:
                $statusCode = Response::HTTP_UNAUTHORIZED;
                $message = 'Token has expired';
                $code = 'TOKEN_EXPIRED';
                break;

            case $exception instanceof InvalidTokenException:
            case $exception instanceof JWTDecodeFailureException:
                $statusCode = Response::HTTP_UNAUTHORIZED;
                $message = 'Invalid authentication token';
                $code = 'INVALID_TOKEN';
                break;

            case $exception instanceof AuthenticationException:
                $statusCode = Response::HTTP_UNAUTHORIZED;
                $message = 'Authentication failed';
                $code = 'AUTHENTICATION_FAILED';
                break;

            case $exception instanceof UnauthorizedHttpException:
                $statusCode = Response::HTTP_UNAUTHORIZED;
                $message = 'Authentication required';
                $code = 'AUTHENTICATION_REQUIRED';
                break;

            case $exception instanceof AccessDeniedHttpException:
                $statusCode = Response::HTTP_FORBIDDEN;
                $message = 'Access denied';
                $code = 'ACCESS_DENIED';
                break;

            case $exception instanceof NotFoundHttpException:
                $statusCode = Response::HTTP_NOT_FOUND;
                $message = 'Resource not found';
                $code = 'NOT_FOUND';
                break;

            case $exception instanceof BadRequestHttpException:
                $statusCode = Response::HTTP_BAD_REQUEST;
                $message = $exception->getMessage() ?: 'Bad request';
                $code = 'BAD_REQUEST';
                break;

            default:
                // For unknown exceptions, return null to let Symfony handle them
                return null;
        }

        $data = [
            'error' => [
                'code' => $code,
                'message' => $message,
                'status' => $statusCode,
            ]
        ];

        // In debug mode, add more details
        if ($this->debug) {
            $data['error']['debug'] = [
                'exception' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ];
        }

        return new JsonResponse($data, $statusCode);
    }
}
