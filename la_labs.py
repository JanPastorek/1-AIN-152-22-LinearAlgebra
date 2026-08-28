"""Small, testable computations for the linear algebra seminar notebooks.

No network, data downloads, paid services, or AI API calls are required.
Plot functions return figures; notebooks own display and widget state.
"""
import numpy as np
import matplotlib.pyplot as plt


def rotation(degrees):
    t = np.deg2rad(degrees)
    return np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])


def transform_matrix(angle=0, shear=0, scale=1):
    """First scale x, then shear x, then rotate (rightmost acts first)."""
    return rotation(angle) @ np.array([[1., shear], [0., 1.]]) @ np.diag([scale, 1.])


def transformation_figure(angle=0, shear=0, scale=1):
    A = transform_matrix(angle, shear, scale)
    square = np.array([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]).T
    transformed = A @ square
    fig, axes = plt.subplots(1, 2, figsize=(10, 4), constrained_layout=True)
    limit = max(1.5, np.max(np.abs(transformed)) * 1.2)
    for ax, points, label in zip(axes, [square, transformed], ['Original square', 'Transformed square']):
        ax.plot(*points, 'o-', color='#145da0')
        ax.fill(*points, alpha=.15, color='#145da0')
        ax.axhline(0, color='gray', linewidth=.5); ax.axvline(0, color='gray', linewidth=.5)
        ax.set(xlim=(-limit, limit), ylim=(-limit, limit), xlabel='x', ylabel='y', title=label)
        ax.set_aspect('equal'); ax.grid(alpha=.25)
    fig.suptitle(f'det(A) = {np.linalg.det(A):.3g}; lengths of columns = {np.linalg.norm(A, axis=0).round(3)}')
    return fig, A


def triangular_solve(A, b, *, lower):
    A, b = np.asarray(A, dtype=float), np.asarray(b, dtype=float)
    if A.ndim != 2 or A.shape[0] != A.shape[1] or b.shape != (A.shape[0],):
        raise ValueError('Expected a square matrix and a matching vector.')
    if not np.all(np.isfinite(A)) or not np.all(np.isfinite(b)):
        raise ValueError('Entries must be finite.')
    forbidden = np.triu(A, 1) if lower else np.tril(A, -1)
    if np.any(forbidden != 0):
        raise ValueError('Matrix is not triangular in the requested direction.')
    if np.any(np.diag(A) == 0):
        raise ValueError('A zero diagonal requires a consistency/nonuniqueness analysis.')
    x = np.zeros(len(b))
    indices = range(len(b)) if lower else range(len(b)-1, -1, -1)
    for i in indices:
        x[i] = (b[i] - A[i] @ x) / A[i, i]
    return x


def sensitivity(epsilon, delta):
    if not np.isfinite(epsilon) or epsilon <= 0 or not np.isfinite(delta):
        raise ValueError('Use positive finite epsilon and finite delta.')
    A = np.array([[1., 1.], [1., 1. + epsilon]])
    if A[1, 1] == 1:
        raise ValueError('Epsilon is too small to represent in this floating-point matrix.')
    b = np.array([2., 2. + epsilon + delta])
    computed = np.linalg.solve(A, b)
    ideal = np.array([1. - delta/epsilon, 1. + delta/epsilon])
    return A, b, computed, ideal


def sensitivity_figure(log_epsilon=-4, relative_change=1):
    epsilon = 10.**log_epsilon
    delta = relative_change * epsilon
    A, b, computed, ideal = sensitivity(epsilon, delta)
    xs = np.linspace(min(-1, computed[0]-1), max(3, computed[0]+1), 300)
    fig, ax = plt.subplots(figsize=(7, 4), constrained_layout=True)
    ax.plot(xs, 2-xs, label='x + y = 2')
    ax.plot(xs, (b[1]-xs)/(1+epsilon), '--', label='perturbed second equation')
    ax.plot(*computed, 'o', label='numerical intersection')
    ax.set(xlabel='x', ylabel='y', title=f'ε={epsilon:.1e}, δ={delta:.1e}; nearly parallel lines')
    ax.legend(); ax.grid(alpha=.25)
    return fig, dict(computed=computed, ideal=ideal, residual=np.linalg.norm(A@computed-b), condition=np.linalg.cond(A))


def orthogonal_projection(b, u):
    b, u = np.asarray(b, float), np.asarray(u, float)
    if b.ndim != 1 or b.shape != u.shape or not np.all(np.isfinite([b, u])):
        raise ValueError('Expected finite vectors of the same shape.')
    if not np.any(u):
        # The subspace is {0}; the quotient formula and angle are undefined.
        return np.zeros_like(b), b.copy()
    p = (b @ u)/(u @ u)*u
    return p, b-p


def projection_figure(angle=45, bx=3, by=1):
    u = rotation(angle) @ np.array([1., 0.])
    b = np.array([bx, by]); p, residual = orthogonal_projection(b, u)
    lim = max(2., np.max(np.abs([b, p]))*1.3)
    fig, ax = plt.subplots(figsize=(6, 5), constrained_layout=True)
    ax.plot([-lim*u[0], lim*u[0]], [-lim*u[1], lim*u[1]], color='gray', label='projection line')
    for v, label, color in [(b, 'b', '#145da0'), (p, 'projection', '#b45309')]:
        ax.quiver(0, 0, *v, angles='xy', scale_units='xy', scale=1, color=color)
        ax.text(*v, ' '+label)
    ax.plot([p[0], b[0]], [p[1], b[1]], 'k--', label='residual')
    ax.set(xlim=(-lim, lim), ylim=(-lim, lim), xlabel='x', ylabel='y', title=f'u · residual = {u@residual:.2e}')
    ax.set_aspect('equal'); ax.grid(alpha=.25); ax.legend()
    return fig, p, residual


def normal_and_area(u, v):
    u, v = np.asarray(u, float), np.asarray(v, float)
    if u.shape != (3,) or v.shape != (3,) or not np.all(np.isfinite([u, v])):
        raise ValueError('Expected finite three-dimensional vectors.')
    normal = np.cross(u, v)
    magnitude = np.linalg.norm(normal)
    return normal, (None if magnitude == 0 else normal/magnitude), magnitude/2


def change_basis(A, S, T=None):
    """S/T contain domain/codomain basis vectors as columns."""
    A, S = np.asarray(A, float), np.asarray(S, float)
    T = S if T is None else np.asarray(T, float)
    return np.linalg.solve(T, A @ S)


def homogeneous(A, offset):
    A, offset = np.asarray(A, float), np.asarray(offset, float)
    if A.ndim != 2 or A.shape[0] != A.shape[1] or offset.shape != (A.shape[0],):
        raise ValueError('Expected square linear part and matching offset.')
    H = np.eye(A.shape[0]+1)
    H[:-1, :-1] = A; H[:-1, -1] = offset
    return H


def affine_figure(angle=90, tx=2, ty=1):
    A = rotation(angle); c = np.array([tx, ty])
    triangle = np.array([[0, 0], [1, 0], [0, 1], [0, 0]]).T
    first = A @ triangle + c[:, None]
    second = A @ (triangle + c[:, None])
    fig, ax = plt.subplots(figsize=(7, 5), constrained_layout=True)
    for pts, style, label in [(triangle, ':', 'original'), (first, '-', 'rotate, then translate'), (second, '--', 'translate, then rotate')]:
        ax.plot(*pts, style, marker='o', label=label)
    ax.set_aspect('equal', adjustable='datalim'); ax.grid(alpha=.25); ax.legend()
    ax.set(xlabel='x', ylabel='y', title='Affine composition order')
    return fig, homogeneous(A, c)


def markov_matrix(a, b):
    if not np.isfinite(a+b) or not (0 <= a <= 1 and 0 <= b <= 1):
        raise ValueError('Transition fractions must lie in [0,1].')
    return np.array([[1.-a, b], [a, 1.-b]])


def markov_orbit(a, b, p=1., steps=20):
    P = markov_matrix(a, b)
    if not 0 <= p <= 1 or not isinstance(steps, (int, np.integer)) or steps < 0:
        raise ValueError('Use a probability p and a nonnegative integer step count.')
    orbit = np.empty((steps+1, 2)); orbit[0] = [p, 1-p]
    for t in range(steps): orbit[t+1] = P @ orbit[t]
    stationary = None if a+b == 0 else np.array([b/(a+b), a/(a+b)])
    return orbit, stationary, 1-a-b


def dynamics_figure(a=.1, b=.2, p=1.):
    orbit, stationary, eigenvalue = markov_orbit(a, b, p)
    fig, ax = plt.subplots(figsize=(8, 4), constrained_layout=True)
    ax.plot(orbit[:, 0], 'o-', label='app 1'); ax.plot(orbit[:, 1], 's--', label='app 2')
    if stationary is not None:
        ax.axhline(stationary[0], color='gray', linestyle=':', label='stationary share: app 1')
    status = 'every distribution is stationary' if stationary is None else ('oscillation except at stationarity' if a+b == 2 else 'converges to the unique stationary distribution')
    ax.set(xlabel='time step', ylabel='population fraction', ylim=(-.05, 1.05), title=f'Other eigenvalue: {eigenvalue:.2f}; {status}')
    ax.legend(); ax.grid(alpha=.25)
    return fig, orbit, stationary, eigenvalue


def interactive_plot(callback, specifications):
    """Float sliders; also renders once in static or widget-free environments.

    A notebook still displays numerical values/tables and has paper tasks.
    Return widget objects so a caller can exercise their state in kernel tests.
    """
    defaults = {key: spec[3] for key, spec in specifications.items()}
    callback(**defaults)
    try:
        import ipywidgets as widgets
        from IPython.display import display, clear_output
    except ImportError:
        print('Widgets unavailable: edit the callback arguments above to explore another case.')
        return None
    sliders = {key: widgets.FloatSlider(description=key, min=s[0], max=s[1], step=s[2], value=s[3], continuous_update=False) for key, s in specifications.items()}
    out = widgets.Output()
    def update(change):
        with out:
            clear_output(wait=True)
            callback(**{key: slider.value for key, slider in sliders.items()})
    for slider in sliders.values(): slider.observe(update, names='value')
    display(widgets.VBox(list(sliders.values())+[out]))
    return sliders
