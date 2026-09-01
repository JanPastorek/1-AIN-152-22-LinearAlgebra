"""Exact regression checks for worked examples and corrected misconceptions."""
import sympy as s
import pytest


def test_tomography_family_and_sensor():
    A=s.Matrix([[1,1,0,0],[0,0,1,1],[1,0,1,0],[0,1,0,1]])
    t=s.symbols('t'); x=s.Matrix([t,5-t,6-t,3+t]); v=x.diff(t)
    assert A*x == s.Matrix([5,9,6,8])
    assert A.rank()==3 and A*v==s.zeros(4,1)
    assert s.Matrix([[1,0,0,1]]).dot(v)==2
    assert x.subs(t,2)==s.Matrix([2,3,4,5])
    assert (s.Matrix([[2,1,0,0]])*x)[0]==t+5


def test_traffic_certificate():
    A=s.Matrix([[1,0,0,-1],[-1,1,0,0],[0,-1,1,0],[0,0,-1,1]])
    t=s.symbols('t'); b=s.Matrix([3,-1,-2,0])
    assert A*s.Matrix([t+3,t+2,t,t])==b
    y=s.ones(4,1)
    assert y.T*A==s.zeros(1,4)
    assert (y.T*s.Matrix([4,-1,-2,0]))[0]==1


def test_lu_factors_and_rhs():
    A=s.Matrix([[2,1,1],[4,3,3],[2,2,3]])
    L=s.Matrix([[1,0,0],[2,1,0],[1,1,1]])
    U=s.Matrix([[2,1,1],[0,1,1],[0,0,1]])
    assert L*U==A
    assert A*s.Matrix([1,1,1])==s.Matrix([4,10,7])
    assert A*s.Matrix([1,0,2])==s.Matrix([4,10,8])


def test_symbolic_lu_including_singular_branch():
    a,b=s.symbols('a b')
    A=s.Matrix([[1,0,1],[a,a,a],[b,b,a]])
    L=s.Matrix([[1,0,0],[a,1,0],[b,b/a,1]])
    U=s.Matrix([[1,0,1],[0,a,0],[0,0,a-b]])
    assert s.simplify(L*U-A)==s.zeros(3)
    assert L.subs({a:1,b:1})*U.subs({a:1,b:1})==A.subs({a:1,b:1})
    assert A.subs({a:1,b:1}).det()==0
    A0=A.subs({a:0,b:0})
    assert A0.is_upper and s.eye(3)*A0==A0


def test_rank_nullity_and_ambient_spaces():
    A=s.Matrix([[1,2,3,1],[1,1,2,1],[1,2,3,1]])
    V=s.Matrix([[-1,-1],[-1,0],[1,0],[0,1]])
    assert A*V==s.zeros(3,2) and V.rank()==2 and A.rank()==2
    assert A[:,0:2].rank()==2
    assert A*s.Matrix([0,1,0,0])==s.Matrix([2,1,2])


def test_determinant_parameter_cases():
    a,b=s.symbols('a b')
    A=s.Matrix([[a,b,b],[a,a,b],[a,a,a]])
    assert s.factor(A.det())==a*(a-b)**2
    assert s.Matrix([[2,1,3],[0,-1,4],[5,2,0]]).det()==19


def test_polynomial_maps_and_network():
    D=s.Matrix([[0,1,0],[0,0,2]])
    E=s.Matrix([[1,0,0],[1,1,1]])
    assert D.rank()==2 and D*s.Matrix([1,0,0])==s.zeros(2,1)
    assert E*s.Matrix([0,-1,1])==s.zeros(2,1) and E.rank()==2
    A=s.Matrix([[1,0,1],[0,1,1]])
    B=s.Matrix([[1,0],[0,1],[1,1]])
    assert B*A==s.Matrix([[1,0,1],[0,1,1],[1,1,2]])
    assert A*s.Matrix([-1,-1,1])==s.zeros(2,1)


def test_projection_normal_and_least_squares():
    u=s.Matrix([1,2]); b=s.Matrix([3,1]); P=u*u.T/(u.dot(u))
    assert P*b==u and u.dot(b-P*b)==0
    assert P*P==P and P.T==P
    normal=s.Matrix([1,1,0]).cross(s.Matrix([0,1,1]))
    assert normal==s.Matrix([1,-1,1])
    X=s.Matrix([[1,0],[1,1],[1,2]]); y=s.Matrix([1,2,2])
    beta=s.Matrix([s.Rational(7,6),s.Rational(1,2)])
    assert X.T*(y-X*beta)==s.zeros(2,1)


def test_change_of_basis_catches_wrong_order():
    A=s.diag(2,1); S=s.Matrix([[1,1],[0,1]])
    C=S.inv()*A*S
    assert C==s.Matrix([[2,1],[0,1]]) and A*S==S*C
    assert S*A*S.inv()!=C


@pytest.mark.parametrize('a,b',[(s.Rational(1,10),s.Rational(1,5)),(s.Rational(1,5),s.Rational(3,10)),(0,1),(1,1)])
def test_markov_modes(a,b):
    a,b=s.sympify(a),s.sympify(b)
    P=s.Matrix([[1-a,b],[a,1-b]])
    pi=s.Matrix([b/(a+b),a/(a+b)])
    v=s.Matrix([1,-1])
    assert P*pi==pi and sum(pi)==1
    assert P*v==(1-a-b)*v


def test_jordan_power():
    J=s.Matrix([[1,1],[0,1]])
    for t in [0,1,2,10]: assert J**t==s.Matrix([[1,t],[0,1]])
    assert len((J-s.eye(2)).nullspace())==1


def test_practice_test_b_answers():
    A=s.Matrix([[1,1,0],[0,1,1]])
    assert A*s.Matrix([-1,1,-1])==s.zeros(2,1) and A.rank()==2
    S=s.Matrix([[1,0],[1,1]]); D=s.diag(1,3)
    assert S.inv()*D*S==s.Matrix([[1,0],[2,3]])
    t=s.symbols('t'); image=s.Matrix([t,7-t,8-t,t-1])
    assert sum(image)==14
    assert image.subs(t,4)==s.Matrix([4,3,4,3])
    P=s.Matrix([[s.Rational(7,10),s.Rational(1,10)],[s.Rational(3,10),s.Rational(9,10)]])
    pi=s.Matrix([s.Rational(1,4),s.Rational(3,4)])
    assert P*pi==pi and set(P.eigenvals())=={1,s.Rational(3,5)}


def test_affine_composition_and_centroid():
    R=s.Matrix([[0,-1],[1,0]]); c=s.Matrix([2,1])
    triangle=[s.zeros(2,1),s.Matrix([1,0]),s.Matrix([0,1])]
    images=[R*x+c for x in triangle]
    centroid=sum(images,s.zeros(2,1))/3
    assert centroid==s.Matrix([s.Rational(5,3),s.Rational(4,3)])
    assert R*c!=c


@pytest.mark.parametrize('first_x,first_b',[(1,3),(2,4)])
def test_parameter_system_generic_answers(first_x,first_b):
    a,b=s.symbols('a b')
    y=(b-2*first_b)/(a-2); x=(first_b-y)/first_x
    assert s.simplify(first_x*x+y-first_b)==0
    assert s.simplify(2*first_x*x+a*y-b)==0
