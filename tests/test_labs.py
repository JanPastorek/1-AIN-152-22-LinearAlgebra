import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pytest
import la_labs as la


@pytest.mark.parametrize('angle,shear,scale',[(0,0,1),(90,1,1),(0,2,0),(180,-2,-2)])
def test_transformations(angle,shear,scale):
    A=la.transform_matrix(angle,shear,scale)
    assert np.isclose(np.linalg.det(A),scale)
    fig, plotted=la.transformation_figure(angle,shear,scale)
    assert np.allclose(A,plotted)
    plt.close(fig)


def test_triangular_solves_and_failure_cases():
    L=np.array([[1,0,0],[2,1,0],[1,1,1.]])
    U=np.array([[2,1,1],[0,1,1],[0,0,1.]])
    for x in [np.array([1,1,1.]),np.array([1,0,2.])]:
        b=L@U@x
        y=la.triangular_solve(L,b,lower=True)
        assert np.allclose(la.triangular_solve(U,y,lower=False),x)
    with pytest.raises(ValueError): la.triangular_solve(np.diag([1,0]),[1,0],lower=True)
    with pytest.raises(ValueError): la.triangular_solve([[1,1],[1,1]],[1,2],lower=True)


@pytest.mark.parametrize('eps,delta',[(1e-2,0),(1e-4,1e-4),(1e-8,-1e-8)])
def test_sensitivity(eps,delta):
    A,b,x,ideal=la.sensitivity(eps,delta)
    assert np.allclose(A@x,b)
    assert np.allclose(x,ideal,atol=1e-6)


@pytest.mark.parametrize('b,u', [([3,1],[1,2]),([0,0],[1,0]),([1,2],[0,0]),([-1,3],[1,-1])])
def test_projection(b,u):
    p,r=la.orthogonal_projection(b,u)
    assert np.allclose(p+r,b) and np.isclose(np.dot(r,u),0)
    for t in [-3,0,2]: assert np.linalg.norm(r)<=np.linalg.norm(np.asarray(b)-t*np.asarray(u))+1e-12


def test_normals_and_degeneracy():
    n,unit,area=la.normal_and_area([1,1,0],[0,1,1])
    assert np.allclose(n,[1,-1,1]) and np.isclose(np.linalg.norm(unit),1)
    assert np.isclose(area,np.sqrt(3)/2)
    assert la.normal_and_area([1,1,0],[2,2,0])[1] is None
    with pytest.raises(ValueError): la.normal_and_area([1,2],[3,4])


def test_coordinates_and_homogeneous_composition():
    A=np.diag([2.,1.]); S=np.array([[1,1],[0,1.]])
    C=la.change_basis(A,S)
    assert np.allclose(A@S,S@C)
    with pytest.raises(np.linalg.LinAlgError): la.change_basis(A,np.zeros((2,2)))
    H=la.homogeneous(la.rotation(90),[2,1])
    assert np.allclose(H@[0,0,1],[2,1,1])
    assert np.allclose(H@[1,0,0],[0,1,0])


@pytest.mark.parametrize('a,b',[(0,0),(1,1),(.1,.2),(.8,.7),(0,.4),(.4,0)])
@pytest.mark.parametrize('p',[0.,.3,1.])
def test_dynamics_all_boundaries(a,b,p):
    orbit,pi,lam=la.markov_orbit(a,b,p,steps=30)
    assert np.allclose(orbit.sum(axis=1),1) and np.all(orbit>=-1e-14)
    if a+b==0:
        assert pi is None and np.allclose(orbit,orbit[0])
    else:
        assert np.allclose(la.markov_matrix(a,b)@pi,pi)
        assert np.allclose(orbit,pi+lam**np.arange(31)[:,None]*(orbit[0]-pi))


@pytest.mark.parametrize('a,b',[(-.1,.2),(.3,1.1),(float('nan'),.2)])
def test_invalid_transition_parameters(a,b):
    with pytest.raises(ValueError): la.markov_orbit(a,b)


def test_plot_extremes(tmp_path):
    figures=[la.sensitivity_figure(-12,3)[0],la.projection_figure(-180,-4,4)[0],la.affine_figure(-180,3,-3)[0],la.dynamics_figure(0,0,1)[0],la.dynamics_figure(1,1,1)[0]]
    for i,fig in enumerate(figures):
        fig.savefig(tmp_path/f'figure-{i}.png',dpi=80)
        plt.close(fig)
